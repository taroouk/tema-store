-- Manual store order. Lower numbers appear first; existing products keep today's order (featured first, then newest).
ALTER TABLE "Product" ADD COLUMN "position" INTEGER NOT NULL DEFAULT 0;

UPDATE "Product" p
SET "position" = o.rn
FROM (
  SELECT id, (ROW_NUMBER() OVER (ORDER BY "featured" DESC, "createdAt" DESC) - 1)::int AS rn
  FROM "Product"
) o
WHERE p.id = o.id;

CREATE INDEX "Product_position_idx" ON "Product"("position");
