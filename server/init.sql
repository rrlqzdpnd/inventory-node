CREATE TABLE IF NOT EXISTS inv_products(
  id serial primary key,
  name varchar(256) not null,
  slug varchar(256) not null,
  isactive boolean default true,
  description text
);

CREATE TABLE IF NOT EXISTS inv_product_columns(
  id serial primary key,
  product_id int references inv_products(id) not null,
  name varchar(256) not null,
  slug varchar(256) not null,
  type varchar(24) not null,
  is_required boolean default false
);

CREATE TABLE IF NOT EXISTS inv_product_items();
