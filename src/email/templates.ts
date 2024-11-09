import mjml2html from "mjml"

const Header = /*xml*/`
    <mj-column>
        <mj-image width="100px" src="{{image}}"></mj-image>
        <mj-divider border-color="#000000"></mj-divider>
        <mj-text font-size="20px" color="#000000">
            {{title}}
        </mj-text>
    </mj-column>
`

const Content = /*xml*/`
    <mj-column>
        <mj-text font-size="15px" color="#000000">
            {{content}}
        </mj-text>
    </mj-column>
`

const Submission = /*xml*/`
    <mj-column>
        <mj-table>
            <tr>
                <td>Datum:</td>
                <td>{{date}}</td>
            </tr>
            <tr>
                <td>Time:</td>
                <td>{{time}}</td>
            </tr>
            <tr>
                <td>Customer Type:</td>
                <td>{{customer_type}}</td>
            </tr>
            <tr>
                <td>Customer Name:</td>
                <td>{{customer_name}}</td>
            </tr>
            <tr>
                <td>Customer VAT:</td>
                <td>{{customer_vat}}</td>
            </tr>
            <tr>
                <td>Customer CID:</td>
                <td>{{customer_cid}}</td>
            </tr>
            <tr>
                <td>Customer VAT Number:</td>
                <td>{{customer_vat_number}}</td>
            </tr>
            <tr>
                <td>Customer Phone:</td>
                <td>{{customer_phone}}</td>
            </tr>
            <tr>
                <td>Customer Email:</td>
                <td>{{customer_email}}</td>
            </tr>
            <tr>
                <td>Contact Name:</td>
                <td>{{contact_name}}</td>
            </tr>
            <tr>
                <td>Contact Phone:</td>
                <td>{{contact_phone}}</td>
            </tr>
            <tr>
                <td>Contact Email:</td>
                <td>{{contact_email}}</td>
            </tr>
            <tr>
                <td>Address Type:</td>
                <td>{{address_type}}</td>
            </tr>
            <tr>
                <td>Address Street:</td>
                <td>{{address_street}}</td>
            </tr>
            <tr>
                <td>Address City:</td>
                <td>{{address_city}}</td>
            </tr>
            <tr>
                <td>Address ZIP:</td>
                <td>{{address_zip}}</td>
            </tr>
            <tr>
                <td>Address Country:</td>
                <td>{{address_country}}</td>
            </tr>
            <tr>
                <td>Address Note:</td>
                <td>{{address_note}}</td>
            </tr>
            <tr>
                <td>Concrete Type:</td>
                <td>{{config.typBetonu}}</td>
            </tr>
            <tr>
                <td>Aggregate Thickness:</td>
                <td>{{config.tloustkaKameniva}}</td>
            </tr>
            <tr>
                <td>Quality:</td>
                <td>{{config.kvalita}}</td>
            </tr>
            <tr>
                <td>Height:</td>
                <td>{{config.vyska}}</td>
            </tr>
            <tr>
                <td>Note:</td>
                <td>{{config.poznamka}}</td>
            </tr>
        </mj-table>
    </mj-column>
`

const Footer = /*xml*/`
    <mj-column>
        <mj-divider border-color="#000000"></mj-divider>

        <mj-text font-size="10px" color="#000000">
            {{phone}}
        </mj-text>

        <mj-text font-size="10px" color="#000000">
            {{email}}
        </mj-text>
    </mj-column>
`

const AdminButtons = /*xml*/`
    <mj-column>
        <mj-button href="{{approve_url}}" background-color="#000000" color="#ffffff">
            Approve
        </mj-button>
        <mj-button href="{{reject_url}}" background-color="#000000" color="#ffffff">
            Reject
        </mj-button>
    </mj-column>
`

export const OrderEmailTemplateHtml = mjml2html(/*xml*/`
    <mjml>
        <mj-body>
            <mj-section>
                ${Header}

                ${Content}

                ${Submission}

                ${Footer}
            </mj-section>
        </mj-body>
    </mjml>
`, {
    minify: true,
    validationLevel: "strict",
    minifyOptions: {
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
    },
})

export const AdminEmailTemplateHtml = mjml2html(/*xml*/`
    <mjml>
        <mj-body>
            <mj-section>
                ${Header}

                ${Content}

                ${Submission}

                ${AdminButtons}
            </mj-section>
        </mj-body>
    </mjml>
`, {
    minify: true,
    validationLevel: "strict",
    minifyOptions: {
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
    },
})

export default [
    OrderEmailTemplateHtml,
    AdminEmailTemplateHtml,
]
