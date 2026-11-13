-- Kids section: price for ages 7-9 and 10-14 (price = ages 2-6). NULL = same as price.
ALTER TABLE "Product" ADD COLUMN "priceKids7" DECIMAL(10,2);
ALTER TABLE "Product" ADD COLUMN "priceKids10" DECIMAL(10,2);
