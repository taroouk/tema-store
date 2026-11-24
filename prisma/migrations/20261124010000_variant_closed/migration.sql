-- Daily size sheet: a closed size is shown with an X in the store and can't be ordered.
-- Inventory (stock) is not touched when a size is closed or reopened.
ALTER TABLE "ProductVariant" ADD COLUMN "closed" BOOLEAN NOT NULL DEFAULT false;
