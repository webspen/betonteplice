<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { API_BASE_URL } from "@/config";
import { t } from "@/i18n";

const isAuthenticated = ref(false);
const loginError = ref("");
const password = ref("");
const email = ref("");

const orders = ref<any[]>([]);
const currentPage = ref(1);
const totalPages = ref(1);
const itemsPerPage = 10;

const statusFilter = ref("");
const dateFrom = ref("");
const dateTo = ref("");

const handleLogin = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const { token } = await response.json();
    localStorage.setItem("adminToken", token);
    isAuthenticated.value = true;
    loadOrders();
  } catch (error) {
    loginError.value = t("loginError");
    console.error("Error logging in:", error);
  }
};

const loadOrders = async () => {
  try {
    let url = `${API_BASE_URL}/orders?`;

    if (statusFilter.value) {
      url += `status=${statusFilter.value}&`;
    }
    if (dateFrom.value) {
      url += `dateFrom=${dateFrom.value}&`;
    }
    if (dateTo.value) {
      url += `dateTo=${dateTo.value}&`;
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Handle unauthorized access
        isAuthenticated.value = false;
        localStorage.removeItem("adminToken");
        return;
      }
      throw new Error("Failed to load orders");
    }

    const data = await response.json();
    orders.value = data;
    calculatePagination();
  } catch (error) {
    console.error("Error loading orders:", error);
  }
};

const confirmStatusUpdate = async (
  orderId: string,
  status: "accepted" | "rejected" | "cancelled"
) => {
  const action =
    status === "accepted"
      ? t("accept")
      : status === "rejected"
      ? t("reject")
      : t("cancel");
  if (confirm(t("areYouSure") + " " + action + "?")) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({ orderId, status }),
      });

      if (response.ok) {
        await loadOrders();
        alert(t("orderStatusUpdated"));
      } else {
        alert(t("errorUpdatingOrderStatus"));
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert(t("errorUpdatingOrderStatus"));
    }
  }
};

const calculatePagination = () => {
  totalPages.value = Math.ceil(orders.value.length / itemsPerPage);
};

const changePage = (page: number) => {
  currentPage.value = page;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("cs-CZ");
};

onMounted(() => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    isAuthenticated.value = true;
    loadOrders();
  }
});

const filteredOrders = computed(() => {
  // Show paginated orders
  return orders.value.slice(
    (currentPage.value - 1) * itemsPerPage,
    currentPage.value * itemsPerPage
  );
});
</script>

<template>
  <div v-if="!isAuthenticated" class="login-container">
    <div class="login-box">
      <h2>{{ t("adminLogin") }}</h2>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>{{ t("email") }}</label>
          <input type="email" v-model="email" required />
        </div>
        <div class="form-group">
          <label>{{ t("password") }}</label>
          <input type="password" v-model="password" required />
        </div>
        <button type="submit">{{ t("login") }}</button>
        <p v-if="loginError" class="error">{{ loginError }}</p>
      </form>
    </div>
  </div>

  <div v-else class="admin-container">
    <h1>{{ t("title") }}</h1>

    <div class="filters">
      <select v-model="statusFilter">
        <option value="">{{ t("allStatus") }}</option>
        <option value="pending">{{ t("pending") }}</option>
        <option value="accepted">{{ t("accepted") }}</option>
        <option value="rejected">{{ t("rejected") }}</option>
        <option value="cancelled">{{ t("cancelled") }}</option>
      </select>

      <input type="date" v-model="dateFrom" :placeholder="t('dateFrom')" />
      <input type="date" v-model="dateTo" :placeholder="t('dateTo')" />
      <button @click="loadOrders">{{ t("applyFilters") }}</button>
    </div>

    <table class="orders-table">
      <thead>
        <tr>
          <th>{{ t("date") }}</th>
          <th>{{ t("customerName") }}</th>
          <th>{{ t("phone") }}</th>
          <th>{{ t("email") }}</th>
          <th>{{ t("address") }}</th>
          <th>{{ t("status") }}</th>
          <th>{{ t("actions") }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in filteredOrders" :key="order.id">
          <td>{{ formatDate(order.date) }}</td>
          <td>{{ order.customer_name }}</td>
          <td>{{ order.customer_phone }}</td>
          <td>{{ order.customer_email }}</td>
          <td>{{ `${order.address_street}, ${order.address_city}` }}</td>
          <td>{{ order.status }}</td>
          <td>
            <div class="action-buttons" v-if="order.status === 'pending'">
              <button
                @click="confirmStatusUpdate(order.id, 'accepted')"
                class="accept-btn"
              >
                {{ t("acceptOrder") }}
              </button>
              <button
                @click="confirmStatusUpdate(order.id, 'rejected')"
                class="reject-btn"
              >
                {{ t("rejectOrder") }}
              </button>
            </div>
            <div class="action-buttons" v-if="order.status === 'accepted'">
              <button
                @click="confirmStatusUpdate(order.id, 'cancelled')"
                class="reject-btn"
              >
                {{ t("cancelOrder") }}
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="pagination">
      <button
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
        class="pagination-button"
      >
        {{ t("previous") }}
      </button>
      <span
        >{{ t("page") }} {{ currentPage }} {{ t("of") }} {{ totalPages }}</span
      >
      <button
        :disabled="currentPage === totalPages"
        @click="changePage(currentPage + 1)"
        class="pagination-button"
      >
        {{ t("next") }}
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

.pagination-button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}
</style>
