-- CreateTable
CREATE TABLE "report_generations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "report_id" VARCHAR(100) NOT NULL,
    "lorry_id" UUID NOT NULL,
    "farmer_id" UUID NOT NULL,
    "generated_by_id" UUID NOT NULL,
    "report_type" VARCHAR(50) NOT NULL,
    "report_data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_generations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "report_generations_report_id_key" ON "report_generations"("report_id");

-- AddForeignKey
ALTER TABLE "report_generations" ADD CONSTRAINT "report_generations_generated_by_id_fkey" FOREIGN KEY ("generated_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
