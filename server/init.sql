CREATE TABLE IF NOT EXISTS inv_products(
  id serial primary key,
  name varchar(256) not null,
  slug varchar(256) not null,
  is_active boolean default true,
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

CREATE TABLE IF NOT EXISTS inv_items(
  id serial primary key,
  product_id int references inv_products(id) not null
);

CREATE TABLE IF NOT EXISTS inv_item_columns(
  id serial primary key,
  item_id int references inv_items(id) on delete cascade not null,
  column_id int references inv_product_columns(id) not null,
  value varchar(2048)
);
