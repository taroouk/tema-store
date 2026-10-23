-- Brand renamed to "Tema Label"
ALTER TABLE "StoreSettings" ALTER COLUMN "storeName" SET DEFAULT 'Tema Label';
UPDATE "StoreSettings" SET "storeName" = 'Tema Label' WHERE "storeName" = 'TEMA';
