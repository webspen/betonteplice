<script setup lang="ts">
import "@vuepic/vue-datepicker/dist/main.css"
import { ref, onMounted } from "vue"

const isAuthenticated = ref(false)
const email = ref("admin@betonteplice.cz")
const password = ref("")
const loginError = ref("")
const orders = ref<any[]>([])
const currentPage = ref(1)
const totalPages = ref(1)
const itemsPerPage = 10
const statusFilter = ref("")
const dateFrom = ref("")
const dateTo = ref("")

const handleLogin = async () => {
    const url = new URL(`${import.meta.env.VITE_API_URL}/verify-password`)
    url.searchParams.append("password", password.value)

    const res = await fetch(url.toString())

    if (res.ok) {
        isAuthenticated.value = true
        localStorage.setItem("adminAuthenticated", "true")
        loadOrders()
    } else loginError.value = "Neplatné přihlašovací údaje"
}

const loadOrders = async () => {
    try {
        let url = `${import.meta.env.VITE_API_URL}/orders?`

        if (statusFilter.value) {
            url += `status=${statusFilter.value}&`
        }
        if (dateFrom.value) {
            url += `dateFrom=${dateFrom.value}&`
        }
        if (dateTo.value) {
            url += `dateTo=${dateTo.value}&`
        }

        const response = await fetch(url)
        const data = await response.json()
        orders.value = data
        calculatePagination()
    } catch (error) {
        console.error("Error loading orders:", error)
    }
}

const confirmStatusUpdate = async (
    orderId: string,
    status: "accepted" | "rejected" | "cancelled"
) => {
    const action =
        status === "accepted"
            ? "přijmout"
            : status === "rejected"
                ? "zamítnout"
                : "zrušit"
    if (confirm(`Opravdu chcete ${action} tuto poptávku?`)) {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/orders/${orderId}/status`,
                {
                    method: "PUT",
                    body: JSON.stringify({ orderId, status }),
                }
            )

            if (response.ok) {
                await loadOrders()
                alert("Poptávka byla aktualizována")
            } else {
                alert("Nepodařilo se aktualizovat poptávku")
            }
        } catch (error) {
            console.error("Error updating order status:", error)
            alert("Chyba při aktualizaci poptávky")
        }
    }
}

const calculatePagination = () => {
    totalPages.value = Math.ceil(orders.value.length / itemsPerPage)
}

const changePage = (page: number) => {
    currentPage.value = page
}

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("cs-CZ")
}

onMounted(() => {
    if (localStorage.getItem("adminAuthenticated") === "true") {
        isAuthenticated.value = true
        loadOrders()
    }
})
</script>

<template>
    <div v-if="!isAuthenticated" class="login-container">
        <div class="login-box">
            <h2>Admin Login</h2>
            <form @submit.prevent="handleLogin" class="login-form">
                <div class="form-group">
                    <label>Email:</label>
                    <input type="email" v-model="email" required disabled />
                </div>
                <div class="form-group">
                    <label>Heslo:</label>
                    <input type="password" v-model="password" required />
                </div>
                <button type="submit">Login</button>
                <p v-if="loginError" class="error">{{ loginError }}</p>
            </form>
        </div>
    </div>

    <div v-else class="admin-container">
        <h1>Poptávky</h1>

        <div class="filters">
            <select v-model="statusFilter">
                <option value="">Vsechno</option>
                <option value="pending">Ceka na schvaleni</option>
                <option value="accepted">Prijmout</option>
                <option value="rejected">Zamitnout</option>
                <option value="cancelled">Zrusit</option>
            </select>

            <input type="date" v-model="dateFrom" placeholder="Datum od" />
            <input type="date" v-model="dateTo" placeholder="Datum do" />
            <button @click="loadOrders">Aplikovat filtry</button>
        </div>

        <table class="orders-table">
            <thead>
                <tr>
                    <th>Datum</th>
                    <th>Jméno</th>
                    <th>Telefon</th>
                    <th>Email</th>
                    <th>Adresa</th>
                    <th>Status</th>
                    <th>Akce</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="order in orders" :key="order.id">
                    <td>{{ formatDate(order.date) }}</td>
                    <td>{{ order.customer_name }}</td>
                    <td>{{ order.customer_phone }}</td>
                    <td>{{ order.customer_email }}</td>
                    <td>{{ `${order.address_street}, ${order.address_city}` }}</td>
                    <td>{{ order.status }}</td>
                    <td>
                        <div class="action-buttons" v-if="order.status === 'pending'">
                            <button @click="confirmStatusUpdate(order.id, 'accepted')" class="accept-btn">
                                Přijmout
                            </button>
                            <button @click="confirmStatusUpdate(order.id, 'rejected')" class="reject-btn">
                                Zamítnout
                            </button>
                        </div>
                        <div class="action-buttons" v-if="order.status === 'accepted'">
                            <button @click="confirmStatusUpdate(order.id, 'cancelled')" class="reject-btn">
                                Zrušit
                            </button>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>

        <div class="pagination">
            <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
                Předchozí
            </button>
            <span>Strana {{ currentPage }} z {{ totalPages }}</span>
            <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">
                Další
            </button>
        </div>
    </div>
</template>

<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f5f5f5;
}

.login-box {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
}

.login-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.error {
    color: red;
    margin-top: 1rem;
}

.admin-container {
    padding: 2rem;
}

.filters {
    margin: 1rem 0;
    display: flex;
    gap: 1rem;
}

.orders-table {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
}

.orders-table th,
.orders-table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
}

.orders-table th {
    background-color: #f5f5f5;
}

.action-buttons {
    display: flex;
    gap: 0.5rem;
}

.accept-btn {
    background-color: #4caf50;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
}

.reject-btn {
    background-color: #f44336;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
}

.pagination {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 1rem;
}
</style>
