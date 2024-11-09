create table if not exists orders (
    -- System
    id serial primary key,
    status text not null default 'pending',
    created_at timestamp not null,
    updated_at timestamp not null,

    -- User
    date date not null,
    time time not null,

    customer_type text not null default 'fyzicka',
    customer_name text not null,
    customer_vat boolean not null default false,
    customer_cid text null,
    customer_vat_number text null,

    customer_phone text not null,
    customer_email text not null,

    contact_name text null,
    contact_phone text null,
    contact_email text null,

    address_type text not null default 'existujici',
    address_street text not null,
    address_city text not null,
    address_zip text not null,
    address_country text not null,
    address_note text null,

    config jsonb not null,
);
