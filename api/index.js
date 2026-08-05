// server.ts
import express from "express";

// src/generated/prisma/client.ts
import * as path from "node:path";
import { fileURLToPath } from "node:url";

// src/generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.9.0",
  "engineVersion": "e922089b7d7502aff4249d5da3420f6fa55fc6ad",
  "activeProvider": "postgresql",
  "inlineSchema": 'generator client {\n  provider = "prisma-client"\n  output   = "../src/generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel Admin {\n  id       String @id\n  username String @unique\n  password String\n  name     String\n}\n\nmodel Member {\n  id           String           @id @default(cuid())\n  name         String\n  username     String           @unique\n  password     String\n  phone        String           @default("")\n  whatsapp     String\n  birthDate    String           @default("") @map("birth_date")\n  entryDate    String           @default("") @map("entry_date")\n  monthlyFee   Float            @map("monthly_fee")\n  dueDate      Int              @map("due_date")\n  status       String           @default("Ativo")\n  observations String           @default("")\n  createdAt    DateTime         @default(now()) @map("created_at")\n  updatedAt    DateTime         @updatedAt @map("updated_at")\n  payments     Payment[]\n  receipts     PaymentReceipt[]\n\n  @@map("members")\n}\n\nmodel Payment {\n  id          String           @id @default(cuid())\n  memberId    String           @map("member_id")\n  month       String\n  paymentDate String?          @map("payment_date")\n  amount      Float\n  method      String?\n  status      String\n  createdAt   DateTime         @default(now()) @map("created_at")\n  updatedAt   DateTime         @updatedAt @map("updated_at")\n  member      Member           @relation(fields: [memberId], references: [id], onDelete: Cascade)\n  receipts    PaymentReceipt[]\n\n  @@map("payments")\n}\n\nmodel PaymentReceipt {\n  id          String   @id @default(cuid())\n  paymentId   String   @map("payment_id")\n  memberId    String   @map("member_id")\n  description String\n  amount      Float\n  paidAt      String   @map("paid_at")\n  status      String   @default("Pendente")\n  reviewedBy  String?  @map("reviewed_by")\n  reviewedAt  String?  @map("reviewed_at")\n  createdAt   DateTime @default(now()) @map("created_at")\n  updatedAt   DateTime @updatedAt @map("updated_at")\n  payment     Payment  @relation(fields: [paymentId], references: [id], onDelete: Cascade)\n  member      Member   @relation(fields: [memberId], references: [id], onDelete: Cascade)\n\n  @@map("payment_receipts")\n}\n\nmodel Expense {\n  id          String   @id @default(cuid())\n  description String\n  amount      Float\n  date        String\n  createdAt   DateTime @default(now()) @map("created_at")\n  updatedAt   DateTime @updatedAt @map("updated_at")\n\n  @@map("expenses")\n}\n\nmodel AppSettings {\n  id                String   @id @default(cuid())\n  pixKey            String   @default("") @map("pix_key")\n  bankName          String   @default("") @map("bank_name")\n  accountName       String   @default("") @map("account_name")\n  defaultMonthlyFee Float    @default(50) @map("default_monthly_fee")\n  defaultDueDate    Int      @default(10) @map("default_due_date")\n  houseGuidelines   String   @default("") @map("house_guidelines")\n  createdAt         DateTime @default(now()) @map("created_at")\n  updatedAt         DateTime @updatedAt @map("updated_at")\n\n  @@map("app_settings")\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"Admin":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"username","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"}],"dbName":null},"Member":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"username","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"whatsapp","kind":"scalar","type":"String"},{"name":"birthDate","kind":"scalar","type":"String","dbName":"birth_date"},{"name":"entryDate","kind":"scalar","type":"String","dbName":"entry_date"},{"name":"monthlyFee","kind":"scalar","type":"Float","dbName":"monthly_fee"},{"name":"dueDate","kind":"scalar","type":"Int","dbName":"due_date"},{"name":"status","kind":"scalar","type":"String"},{"name":"observations","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"updatedAt","kind":"scalar","type":"DateTime","dbName":"updated_at"},{"name":"payments","kind":"object","type":"Payment","relationName":"MemberToPayment"},{"name":"receipts","kind":"object","type":"PaymentReceipt","relationName":"MemberToPaymentReceipt"}],"dbName":"members"},"Payment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"memberId","kind":"scalar","type":"String","dbName":"member_id"},{"name":"month","kind":"scalar","type":"String"},{"name":"paymentDate","kind":"scalar","type":"String","dbName":"payment_date"},{"name":"amount","kind":"scalar","type":"Float"},{"name":"method","kind":"scalar","type":"String"},{"name":"status","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"updatedAt","kind":"scalar","type":"DateTime","dbName":"updated_at"},{"name":"member","kind":"object","type":"Member","relationName":"MemberToPayment"},{"name":"receipts","kind":"object","type":"PaymentReceipt","relationName":"PaymentToPaymentReceipt"}],"dbName":"payments"},"PaymentReceipt":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"paymentId","kind":"scalar","type":"String","dbName":"payment_id"},{"name":"memberId","kind":"scalar","type":"String","dbName":"member_id"},{"name":"description","kind":"scalar","type":"String"},{"name":"amount","kind":"scalar","type":"Float"},{"name":"paidAt","kind":"scalar","type":"String","dbName":"paid_at"},{"name":"status","kind":"scalar","type":"String"},{"name":"reviewedBy","kind":"scalar","type":"String","dbName":"reviewed_by"},{"name":"reviewedAt","kind":"scalar","type":"String","dbName":"reviewed_at"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"updatedAt","kind":"scalar","type":"DateTime","dbName":"updated_at"},{"name":"payment","kind":"object","type":"Payment","relationName":"PaymentToPaymentReceipt"},{"name":"member","kind":"object","type":"Member","relationName":"MemberToPaymentReceipt"}],"dbName":"payment_receipts"},"Expense":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"amount","kind":"scalar","type":"Float"},{"name":"date","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"updatedAt","kind":"scalar","type":"DateTime","dbName":"updated_at"}],"dbName":"expenses"},"AppSettings":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"pixKey","kind":"scalar","type":"String","dbName":"pix_key"},{"name":"bankName","kind":"scalar","type":"String","dbName":"bank_name"},{"name":"accountName","kind":"scalar","type":"String","dbName":"account_name"},{"name":"defaultMonthlyFee","kind":"scalar","type":"Float","dbName":"default_monthly_fee"},{"name":"defaultDueDate","kind":"scalar","type":"Int","dbName":"default_due_date"},{"name":"houseGuidelines","kind":"scalar","type":"String","dbName":"house_guidelines"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"updatedAt","kind":"scalar","type":"DateTime","dbName":"updated_at"}],"dbName":"app_settings"}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","Admin.findUnique","Admin.findUniqueOrThrow","orderBy","cursor","Admin.findFirst","Admin.findFirstOrThrow","Admin.findMany","data","Admin.createOne","Admin.createMany","Admin.createManyAndReturn","Admin.updateOne","Admin.updateMany","Admin.updateManyAndReturn","create","update","Admin.upsertOne","Admin.deleteOne","Admin.deleteMany","having","_count","_min","_max","Admin.groupBy","Admin.aggregate","member","payment","receipts","payments","Member.findUnique","Member.findUniqueOrThrow","Member.findFirst","Member.findFirstOrThrow","Member.findMany","Member.createOne","Member.createMany","Member.createManyAndReturn","Member.updateOne","Member.updateMany","Member.updateManyAndReturn","Member.upsertOne","Member.deleteOne","Member.deleteMany","_avg","_sum","Member.groupBy","Member.aggregate","Payment.findUnique","Payment.findUniqueOrThrow","Payment.findFirst","Payment.findFirstOrThrow","Payment.findMany","Payment.createOne","Payment.createMany","Payment.createManyAndReturn","Payment.updateOne","Payment.updateMany","Payment.updateManyAndReturn","Payment.upsertOne","Payment.deleteOne","Payment.deleteMany","Payment.groupBy","Payment.aggregate","PaymentReceipt.findUnique","PaymentReceipt.findUniqueOrThrow","PaymentReceipt.findFirst","PaymentReceipt.findFirstOrThrow","PaymentReceipt.findMany","PaymentReceipt.createOne","PaymentReceipt.createMany","PaymentReceipt.createManyAndReturn","PaymentReceipt.updateOne","PaymentReceipt.updateMany","PaymentReceipt.updateManyAndReturn","PaymentReceipt.upsertOne","PaymentReceipt.deleteOne","PaymentReceipt.deleteMany","PaymentReceipt.groupBy","PaymentReceipt.aggregate","Expense.findUnique","Expense.findUniqueOrThrow","Expense.findFirst","Expense.findFirstOrThrow","Expense.findMany","Expense.createOne","Expense.createMany","Expense.createManyAndReturn","Expense.updateOne","Expense.updateMany","Expense.updateManyAndReturn","Expense.upsertOne","Expense.deleteOne","Expense.deleteMany","Expense.groupBy","Expense.aggregate","AppSettings.findUnique","AppSettings.findUniqueOrThrow","AppSettings.findFirst","AppSettings.findFirstOrThrow","AppSettings.findMany","AppSettings.createOne","AppSettings.createMany","AppSettings.createManyAndReturn","AppSettings.updateOne","AppSettings.updateMany","AppSettings.updateManyAndReturn","AppSettings.upsertOne","AppSettings.deleteOne","AppSettings.deleteMany","AppSettings.groupBy","AppSettings.aggregate","AND","OR","NOT","id","pixKey","bankName","accountName","defaultMonthlyFee","defaultDueDate","houseGuidelines","createdAt","updatedAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","description","amount","date","paymentId","memberId","paidAt","status","reviewedBy","reviewedAt","month","paymentDate","method","name","username","password","phone","whatsapp","birthDate","entryDate","monthlyFee","dueDate","observations","every","some","none","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","increment","decrement","multiply","divide"]'),
  graph: "pgI9YAdwAADBAQAwcQAABAAQcgAAwQEAMHMBAAAAAZMBAQCrAQAhlAEBAAAAAZUBAQCrAQAhAQAAAAEAIAEAAAABACAHcAAAwQEAMHEAAAQAEHIAAMEBADBzAQCrAQAhkwEBAKsBACGUAQEAqwEAIZUBAQCrAQAhAAMAAAAEACADAAAFADAEAAABACADAAAABAAgAwAABQAwBAAAAQAgAwAAAAQAIAMAAAUAMAQAAAEAIARzAQAAAAGTAQEAAAABlAEBAAAAAZUBAQAAAAEBCAAACQAgBHMBAAAAAZMBAQAAAAGUAQEAAAABlQEBAAAAAQEIAAALADABCAAACwAwBHMBAMcBACGTAQEAxwEAIZQBAQDHAQAhlQEBAMcBACECAAAAAQAgCAAADgAgBHMBAMcBACGTAQEAxwEAIZQBAQDHAQAhlQEBAMcBACECAAAABAAgCAAAEAAgAgAAAAQAIAgAABAAIAMAAAABACAPAAAJACAQAAAOACABAAAAAQAgAQAAAAQAIAMVAACSAgAgFgAAlAIAIBcAAJMCACAHcAAAwAEAMHEAABcAEHIAAMABADBzAQCeAQAhkwEBAJ4BACGUAQEAngEAIZUBAQCeAQAhAwAAAAQAIAMAABYAMBQAABcAIAMAAAAEACADAAAFADAEAAABACATHAAAugEAIB0AALkBACBwAAC4AQAwcQAAKQAQcgAAuAEAMHMBAAAAAXpAAK4BACF7QACuAQAhjQEBAKsBACGTAQEAqwEAIZQBAQAAAAGVAQEAqwEAIZYBAQCrAQAhlwEBAKsBACGYAQEAqwEAIZkBAQCrAQAhmgEIAKwBACGbAQIArQEAIZwBAQCrAQAhAQAAABoAIA4aAAC-AQAgHAAAugEAIHAAAL8BADBxAAAcABByAAC_AQAwcwEAqwEAIXpAAK4BACF7QACuAQAhiAEIAKwBACGLAQEAqwEAIY0BAQCrAQAhkAEBAKsBACGRAQEAvAEAIZIBAQC8AQAhBBoAAJECACAcAACPAgAgkQEAANABACCSAQAA0AEAIA4aAAC-AQAgHAAAugEAIHAAAL8BADBxAAAcABByAAC_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-CAAAAAR_CAAAAAGAAQgAAAABgQEIAAAAAYIBCAAAAAGDAQgApwEAIQ0VAACjAQAgFgAAowEAIBcAAKMBACAsAACmAQAgLQAAowEAIHwCAAAAAX0CAAAABH4CAAAABH8CAAAAAYABAgAAAAGBAQIAAAABggECAAAAAYMBAgClAQAhCxUAAKMBACAWAACkAQAgFwAApAEAIHxAAAAAAX1AAAAABH5AAAAABH9AAAAAAYABQAAAAAGBAUAAAAABggFAAAAAAYMBQACiAQAhCxUAAKMBACAWAACkAQAgFwAApAEAIHxAAAAAAX1AAAAABH5AAAAABH9AAAAAAYABQAAAAAGBAUAAAAABggFAAAAAAYMBQACiAQAhCHwCAAAAAX0CAAAABH4CAAAABH8CAAAAAYABAgAAAAGBAQIAAAABggECAAAAAYMBAgCjAQAhCHxAAAAAAX1AAAAABH5AAAAABH9AAAAAAYABQAAAAAGBAUAAAAABggFAAAAAAYMBQACkAQAhDRUAAKMBACAWAACjAQAgFwAAowEAICwAAKYBACAtAACjAQAgfAIAAAABfQIAAAAEfgIAAAAEfwIAAAABgAECAAAAAYEBAgAAAAGCAQIAAAABgwECAKUBACEIfAgAAAABfQgAAAAEfggAAAAEfwgAAAABgAEIAAAAAYEBCAAAAAGCAQgAAAABgwEIAKYBACENFQAAowEAIBYAAKYBACAXAACmAQAgLAAApgEAIC0AAKYBACB8CAAAAAF9CAAAAAR-CAAAAAR_CAAAAAGAAQgAAAABgQEIAAAAAYIBCAAAAAGDAQgApwEAIQ4VAACjAQAgFgAAqQEAIBcAAKkBACB8AQAAAAF9AQAAAAR-AQAAAAR_AQAAAAGAAQEAAAABgQEBAAAAAYIBAQAAAAGDAQEAqAEAIYQBAQAAAAGFAQEAAAABhgEBAAAAAQt8AQAAAAF9AQAAAAR-AQAAAAR_AQAAAAGAAQEAAAABgQEBAAAAAYIBAQAAAAGDAQEAqQEAIYQBAQAAAAGFAQEAAAABhgEBAAAAAQxwAACqAQAwcQAAhwEAEHIAAKoBADBzAQCrAQAhdAEAqwEAIXUBAKsBACF2AQCrAQAhdwgArAEAIXgCAK0BACF5AQCrAQAhekAArgEAIXtAAK4BACELfAEAAAABfQEAAAAEfgEAAAAEfwEAAAABgAEBAAAAAYEBAQAAAAGCAQEAAAABgwEBAKkBACGEAQEAAAABhQEBAAAAAYYBAQAAAAEIfAgAAAABfQgAAAAEfggAAAAEfwgAAAABgAEIAAAAAYEBCAAAAAGCAQgAAAABgwEIAKYBACEIfAIAAAABfQIAAAAEfgIAAAAEfwIAAAABgAECAAAAAYEBAgAAAAGCAQIAAAABgwECAKMBACEIfEAAAAABfUAAAAAEfkAAAAAEf0AAAAABgAFAAAAAAYEBQAAAAAGCAUAAAAABgwFAAKQBACEJcAAArwEAMHEAAIEBABByAACvAQAwcwEAngEAIXpAAKEBACF7QAChAQAhhwEBAJ4BACGIAQgAnwEAIYkBAQCeAQAhCXAAALABADBxAABuABByAACwAQAwcwEAqwEAIXpAAK4BACF7QACuAQAhhwEBAKsBACGIAQgArAEAIYkBAQCrAQAhDnAAALEBADBxAABoABByAACxAQAwcwEAngEAIXpAAKEBACF7QAChAQAhhwEBAJ4BACGIAQgAnwEAIYoBAQCeAQAhiwEBAJ4BACGMAQEAngEAIY0BAQCeAQAhjgEBALIBACGPAQEAsgEAIQ4VAAC0AQAgFgAAtQEAIBcAALUBACB8AQAAAAF9AQAAAAV-AQAAAAV_AQAAAAGAAQEAAAABgQEBAAAAAYIBAQAAAAGDAQEAswEAIYQBAQAAAAGFAQEAAAABhgEBAAAAAQ4VAAC0AQAgFgAAtQEAIBcAALUBACB8AQAAAAF9AQAAAAV-AQAAAAV_AQAAAAGAAQEAAAABgQEBAAAAAYIBAQAAAAGDAQEAswEAIYQBAQAAAAGFAQEAAAABhgEBAAAAAQh8AgAAAAF9AgAAAAV-AgAAAAV_AgAAAAGAAQIAAAABgQECAAAAAYIBAgAAAAGDAQIAtAEAIQt8AQAAAAF9AQAAAAV-AQAAAAV_AQAAAAGAAQEAAAABgQEBAAAAAYIBAQAAAAGDAQEAtQEAIYQBAQAAAAGFAQEAAAABhgEBAAAAAQxwAAC2AQAwcQAAUgAQcgAAtgEAMHMBAJ4BACF6QAChAQAhe0AAoQEAIYgBCACfAQAhiwEBAJ4BACGNAQEAngEAIZABAQCeAQAhkQEBALIBACGSAQEAsgEAIRFwAAC3AQAwcQAAPAAQcgAAtwEAMHMBAJ4BACF6QAChAQAhe0AAoQEAIY0BAQCeAQAhkwEBAJ4BACGUAQEAngEAIZUBAQCeAQAhlgEBAJ4BACGXAQEAngEAIZgBAQCeAQAhmQEBAJ4BACGaAQgAnwEAIZsBAgCgAQAhnAEBAJ4BACETHAAAugEAIB0AALkBACBwAAC4AQAwcQAAKQAQcgAAuAEAMHMBAKsBACF6QACuAQAhe0AArgEAIY0BAQCrAQAhkwEBAKsBACGUAQEAqwEAIZUBAQCrAQAhlgEBAKsBACGXAQEAqwEAIZgBAQCrAQAhmQEBAKsBACGaAQgArAEAIZsBAgCtAQAhnAEBAKsBACEDnQEAABwAIJ4BAAAcACCfAQAAHAAgA50BAAAgACCeAQAAIAAgnwEAACAAIBAaAAC-AQAgGwAAvQEAIHAAALsBADBxAAAgABByAAC7AQAwcwEAqwEAIXpAAK4BACF7QACuAQAhhwEBAKsBACGIAQgArAEAIYoBAQCrAQAhiwEBAKsBACGMAQEAqwEAIY0BAQCrAQAhjgEBALwBACGPAQEAvAEAIQt8AQAAAAF9AQAAAAV-AQAAAAV_AQAAAAGAAQEAAAABgQEBAAAAAYIBAQAAAAGDAQEAtQEAIYQBAQAAAAGFAQEAAAABhgEBAAAAARAaAAC-AQAgHAAAugEAIHAAAL8BADBxAAAcABByAAC_AQAwcwEAqwEAIXpAAK4BACF7QACuAQAhiAEIAKwBACGLAQEAqwEAIY0BAQCrAQAhkAEBAKsBACGRAQEAvAEAIZIBAQC8AQAhoAEAABwAIKEBAAAcACAVHAAAugEAIB0AALkBACBwAAC4AQAwcQAAKQAQcgAAuAEAMHMBAKsBACF6QACuAQAhe0AArgEAIY0BAQCrAQAhkwEBAKsBACGUAQEAqwEAIZUBAQCrAQAhlgEBAKsBACGXAQEAqwEAIZgBAQCrAQAhmQEBAKsBACGaAQgArAEAIZsBAgCtAQAhnAEBAKsBACGgAQAAKQAgoQEAACkAIA4aAAC-AQAgHAAAugEAIHAAAL8BADBxAAAcABByAAC_AQAwcwEAqwEAIXpAAK4BACF7QACuAQAhiAEIAKwBACGLAQEAqwEAIY0BAQCrAQAhkAEBAKsBACGRAQEAvAEAIZIBAQC8AQAhB3AAAMABADBxAAAXABByAADAAQAwcwEAngEAIZMBAQCeAQAhlAEBAJ4BACGVAQEAngEAIQdwAADBAQAwcQAABAAQcgAAwQEAMHMBAKsBACGTAQEAqwEAIZQBAQCrAQAhlQEBAKsBACEAAAAAAAGlAQEAAAABBaUBCAAAAAGrAQgAAAABrAEIAAAAAa0BCAAAAAGuAQgAAAABBaUBAgAAAAGrAQIAAAABrAECAAAAAa0BAgAAAAGuAQIAAAABAaUBQAAAAAEAAAAAAAAAAAAAAAGlAQEAAAABBQ8AAJ8CACAQAAClAgAgogEAAKACACCjAQAApAIAIKgBAAAeACAFDwAAnQIAIBAAAKICACCiAQAAngIAIKMBAAChAgAgqAEAABoAIAMPAACfAgAgogEAAKACACCoAQAAHgAgAw8AAJ0CACCiAQAAngIAIKgBAAAaACAAAAAAAAUPAACXAgAgEAAAmwIAIKIBAACYAgAgowEAAJoCACCoAQAAGgAgCw8AAOIBADAQAADnAQAwogEAAOMBADCjAQAA5AEAMKQBAADlAQAgpQEAAOYBADCmAQAA5gEAMKcBAADmAQAwqAEAAOYBADCpAQAA6AEAMKoBAADpAQAwCxoAANoBACBzAQAAAAF6QAAAAAF7QAAAAAGHAQEAAAABiAEIAAAAAYsBAQAAAAGMAQEAAAABjQEBAAAAAY4BAQAAAAGPAQEAAAABAgAAACIAIA8AAO0BACADAAAAIgAgDwAA7QEAIBAAAOwBACABCAAAmQIAMBAaAAC-AQAgGwAAvQEAIHAAALsBADBxAAAgABByAAC7AQAwcwEAAAABekAArgEAIXtAAK4BACGHAQEAqwEAIYgBCACsAQAhigEBAKsBACGLAQEAqwEAIYwBAQCrAQAhjQEBAKsBACGOAQEAvAEAIY8BAQC8AQAhAgAAACIAIAgAAOwBACACAAAA6gEAIAgAAOsBACAOcAAA6QEAMHEAAOoBABByAADpAQAwcwEAqwEAIXpAAK4BACF7QACuAQAhhwEBAKsBACGIAQgArAEAIYoBAQCrAQAhiwEBAKsBACGMAQEAqwEAIY0BAQCrAQAhjgEBALwBACGPAQEAvAEAIQ5wAADpAQAwcQAA6gEAEHIAAOkBADBzAQCrAQAhekAArgEAIXtAAK4BACGHAQEAqwEAIYgBCACsAQAhigEBAKsBACGLAQEAqwEAIYwBAQCrAQAhjQEBAKsBACGOAQEAvAEAIY8BAQC8AQAhCnMBAMcBACF6QADKAQAhe0AAygEAIYcBAQDHAQAhiAEIAMgBACGLAQEAxwEAIYwBAQDHAQAhjQEBAMcBACGOAQEA1gEAIY8BAQDWAQAhCxoAANgBACBzAQDHAQAhekAAygEAIXtAAMoBACGHAQEAxwEAIYgBCADIAQAhiwEBAMcBACGMAQEAxwEAIY0BAQDHAQAhjgEBANYBACGPAQEA1gEAIQsaAADaAQAgcwEAAAABekAAAAABe0AAAAABhwEBAAAAAYgBCAAAAAGLAQEAAAABjAEBAAAAAY0BAQAAAAGOAQEAAAABjwEBAAAAAQMPAACXAgAgogEAAJgCACCoAQAAGgAgBA8AAOIBADCiAQAA4wEAMKQBAADlAQAgqAEAAOYBADAAAAAAAAsPAACAAgAwEAAAhQIAMKIBAACBAgAwowEAAIICADCkAQAAgwIAIKUBAACEAgAwpgEAAIQCADCnAQAAhAIAMKgBAACEAgAwqQEAAIYCADCqAQAAhwIAMAsPAAD3AQAwEAAA-wEAMKIBAAD4AQAwowEAAPkBADCkAQAA-gEAIKUBAADmAQAwpgEAAOYBADCnAQAA5gEAMKgBAADmAQAwqQEAAPwBADCqAQAA6QEAMAsbAADZAQAgcwEAAAABekAAAAABe0AAAAABhwEBAAAAAYgBCAAAAAGKAQEAAAABjAEBAAAAAY0BAQAAAAGOAQEAAAABjwEBAAAAAQIAAAAiACAPAAD_AQAgAwAAACIAIA8AAP8BACAQAAD-AQAgAQgAAJYCADACAAAAIgAgCAAA_gEAIAIAAADqAQAgCAAA_QEAIApzAQDHAQAhekAAygEAIXtAAMoBACGHAQEAxwEAIYgBCADIAQAhigEBAMcBACGMAQEAxwEAIY0BAQDHAQAhjgEBANYBACGPAQEA1gEAIQsbAADXAQAgcwEAxwEAIXpAAMoBACF7QADKAQAhhwEBAMcBACGIAQgAyAEAIYoBAQDHAQAhjAEBAMcBACGNAQEAxwEAIY4BAQDWAQAhjwEBANYBACELGwAA2QEAIHMBAAAAAXpAAAAAAXtAAAAAAYcBAQAAAAGIAQgAAAABigEBAAAAAYwBAQAAAAGNAQEAAAABjgEBAAAAAY8BAQAAAAEJHAAA7wEAIHMBAAAAAXpAAAAAAXtAAAAAAYgBCAAAAAGNAQEAAAABkAEBAAAAAZEBAQAAAAGSAQEAAAABAgAAAB4AIA8AAIsCACADAAAAHgAgDwAAiwIAIBAAAIoCACABCAAAlQIAMA4aAAC-AQAgHAAAugEAIHAAAL8BADBxAAAcABByAAC_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-Uxo_VCBAVQxBVgxCVwxDWAxEWQxFWwxGXQJHXiFIYAxJYgJKYyJLZAxMZQxNZgJOaSNPailQbCpRbSpScCpTcSpUcipVdCpWdgJXdytYeSpZewJafCxbfSpcfipdfwJeggEtX4MBM2CFATRhhgE0YokBNGOKATRkiwE0ZY0BNGaPAQJnkAE1aJIBNGmUAQJqlQE2a5YBNGyXATRtmAECbpsBN2-cAT0"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer } = await import("node:buffer");
  const wasmArray = Buffer.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// src/generated/prisma/internal/prismaNamespace.ts
import * as runtime2 from "@prisma/client/runtime/client";
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var defineExtension = runtime2.Extensions.defineExtension;

// src/generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// server.ts
import { PrismaPg } from "@prisma/adapter-pg";
import { MercadoPagoConfig, Preference, Payment as MPPayment } from "mercadopago";
var rawDatabaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
function sanitizeConnectionString(url) {
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete("channel_binding");
    return parsed.toString();
  } catch {
    return url;
  }
}
var databaseUrl = rawDatabaseUrl ? sanitizeConnectionString(rawDatabaseUrl) : void 0;
var prisma = null;
if (databaseUrl) {
  try {
    const adapter = new PrismaPg({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false }
    });
    prisma = new PrismaClient({ adapter });
  } catch (e) {
    console.error("Falha ao inicializar o Prisma Client:", e);
    prisma = null;
  }
} else {
  console.error("DATABASE_URL n\xE3o configurada. Defina a URL do banco PostgreSQL no .env");
}
async function dropLegacyTables() {
  const cols = await prisma.$queryRawUnsafe(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'Admin'`
  );
  const hasLegacyAdmin = cols.length > 0 && !cols.some((c) => c.column_name === "username");
  if (hasLegacyAdmin) {
    console.log("Schema legado detectado; recriando tabelas...");
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "payment_receipts" CASCADE`);
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "payments" CASCADE`);
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "members" CASCADE`);
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "expenses" CASCADE`);
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "app_settings" CASCADE`);
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "Admin" CASCADE`);
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "Member" CASCADE`);
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "Payment" CASCADE`);
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "Expense" CASCADE`);
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "PaymentReceipt" CASCADE`);
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "AppSettings" CASCADE`);
  }
}
async function initDatabase() {
  await dropLegacyTables();
  await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "Admin" ("id" TEXT NOT NULL PRIMARY KEY, "username" TEXT NOT NULL, "password" TEXT NOT NULL, "name" TEXT NOT NULL)`);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Admin_username_key" ON "Admin"("username")`);
  await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "members" ("id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL, "username" TEXT NOT NULL, "password" TEXT NOT NULL, "phone" TEXT NOT NULL DEFAULT '', "whatsapp" TEXT NOT NULL, "birth_date" TEXT NOT NULL DEFAULT '', "entry_date" TEXT NOT NULL DEFAULT '', "monthly_fee" REAL NOT NULL, "due_date" INTEGER NOT NULL, "status" TEXT NOT NULL DEFAULT 'Ativo', "observations" TEXT NOT NULL DEFAULT '', "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL)`);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "members_username_key" ON "members"("username")`);
  await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "payments" ("id" TEXT NOT NULL PRIMARY KEY, "member_id" TEXT NOT NULL, "month" TEXT NOT NULL, "payment_date" TEXT, "amount" REAL NOT NULL, "method" TEXT, "status" TEXT NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL, CONSTRAINT "payments_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`);
  await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "payment_receipts" ("id" TEXT NOT NULL PRIMARY KEY, "payment_id" TEXT NOT NULL, "member_id" TEXT NOT NULL, "description" TEXT NOT NULL, "amount" REAL NOT NULL, "paid_at" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'Pendente', "reviewed_by" TEXT, "reviewed_at" TEXT, "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL, CONSTRAINT "payment_receipts_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "payment_receipts_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`);
  await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "expenses" ("id" TEXT NOT NULL PRIMARY KEY, "description" TEXT NOT NULL, "amount" REAL NOT NULL, "date" TEXT NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL)`);
  await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "app_settings" ("id" TEXT NOT NULL PRIMARY KEY, "pix_key" TEXT NOT NULL DEFAULT '', "bank_name" TEXT NOT NULL DEFAULT '', "account_name" TEXT NOT NULL DEFAULT '', "default_monthly_fee" REAL NOT NULL DEFAULT 50, "default_due_date" INTEGER NOT NULL DEFAULT 10, "house_guidelines" TEXT NOT NULL DEFAULT '', "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL)`);
}
async function seed() {
  await prisma.admin.upsert({
    where: { username: "admin" },
    update: { password: "admin123", name: "Administrador" },
    create: { id: "admin-1", username: "admin", password: "admin123", name: "Administrador" }
  });
  console.log("Admin garantido: admin / admin123");
}
var app = express();
app.get("/api/health", async (_req, res) => {
  if (!prisma) {
    return res.status(500).json({ status: "error", db: "postgres", connected: false, error: "DATABASE_URL ausente" });
  }
  try {
    const adminCount = await prisma.admin.count();
    res.json({ status: "ok", db: "postgres", adminCount, connected: true });
  } catch (e) {
    res.status(500).json({ status: "error", db: "postgres", connected: false, error: e.message });
  }
});
app.post("/api/auth/admin", async (req, res) => {
  try {
    const username = (req.body.username || "").trim();
    const password = (req.body.password || "").trim();
    if (!username || !password) {
      return res.status(401).json({ error: "Credenciais inv\xE1lidas" });
    }
    const admins = await prisma.admin.findMany();
    const admin = admins.find((a) => a.username.toLowerCase() === username.toLowerCase());
    if (!admin || admin.password !== password) {
      return res.status(401).json({
        error: `Credenciais inv\xE1lidas (Debug: found=${!!admin}, db_pass=${admin?.password}, req_pass=${password})`
      });
    }
    res.json({ id: admin.id, name: admin.name, username: admin.username });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.post("/api/auth/member", async (req, res) => {
  try {
    const username = (req.body.username || "").trim();
    const password = (req.body.password || "").trim();
    if (!username || !password) {
      return res.status(401).json({ error: "Credenciais inv\xE1lidas" });
    }
    const members = await prisma.member.findMany();
    const member = members.find((m) => m.username.toLowerCase() === username.toLowerCase());
    if (!member || member.password !== password) {
      return res.status(401).json({ error: "Credenciais inv\xE1lidas" });
    }
    if (member.status !== "Ativo") {
      return res.status(403).json({ error: "Conta inativa" });
    }
    res.json({ id: member.id, name: member.name });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.get("/api/members", async (_req, res) => {
  try {
    const members = await prisma.member.findMany({ orderBy: { createdAt: "desc" } });
    res.json(members);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.post("/api/members", async (req, res) => {
  try {
    const member = await prisma.member.create({ data: req.body });
    res.json(member);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.put("/api/members/:id", async (req, res) => {
  try {
    const member = await prisma.member.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(member);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.delete("/api/members/:id", async (req, res) => {
  try {
    await prisma.member.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.get("/api/payments", async (_req, res) => {
  try {
    const payments = await prisma.payment.findMany({ orderBy: { createdAt: "desc" } });
    res.json(payments);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.post("/api/payments", async (req, res) => {
  try {
    const payment = await prisma.payment.create({ data: req.body });
    res.json(payment);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.put("/api/payments/:id", async (req, res) => {
  try {
    const payment = await prisma.payment.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(payment);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.delete("/api/payments/:id", async (req, res) => {
  try {
    await prisma.payment.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.post("/api/payments/:id/mercadopago", async (req, res) => {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return res.status(500).json({ error: "Mercado Pago n\xE3o configurado (Access Token ausente)" });
    }
    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id },
      include: { member: true }
    });
    if (!payment) {
      return res.status(404).json({ error: "Pagamento n\xE3o encontrado" });
    }
    const client = new MercadoPagoConfig({ accessToken, options: { timeout: 5e3 } });
    const preference = new Preference(client);
    const pref = await preference.create({
      body: {
        items: [
          {
            id: payment.id,
            title: `Mensalidade ${payment.month} - ${payment.member.name}`,
            quantity: 1,
            unit_price: payment.amount,
            currency_id: "BRL"
          }
        ],
        external_reference: payment.id,
        back_urls: {
          success: `${process.env.APP_URL || "http://localhost:3000"}/members/${payment.memberId}`,
          failure: `${process.env.APP_URL || "http://localhost:3000"}/members/${payment.memberId}`,
          pending: `${process.env.APP_URL || "http://localhost:3000"}/members/${payment.memberId}`
        },
        auto_return: "approved",
        notification_url: `${process.env.APP_URL || "http://localhost:3000"}/api/webhooks/mercadopago`
      }
    });
    res.json({ init_point: pref.init_point });
  } catch (e) {
    console.error("Erro MP:", e);
    res.status(500).json({ error: e.message || "Erro ao gerar link do Mercado Pago" });
  }
});
app.post("/api/webhooks/mercadopago", async (req, res) => {
  try {
    const { action, type, data } = req.body;
    const paymentId = data?.id;
    const notificationType = action || type;
    if (paymentId && (notificationType === "payment.updated" || notificationType === "payment.created" || notificationType === "payment")) {
      const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
      if (accessToken) {
        const client = new MercadoPagoConfig({ accessToken });
        const mpPayment = new MPPayment(client);
        const paymentInfo = await mpPayment.get({ id: paymentId });
        if (paymentInfo.status === "approved" && paymentInfo.external_reference) {
          await prisma.payment.update({
            where: { id: paymentInfo.external_reference },
            data: {
              status: "Pago",
              method: paymentInfo.payment_method_id || "Mercado Pago",
              paymentDate: (/* @__PURE__ */ new Date()).toISOString()
            }
          });
        }
      }
    }
    res.status(200).send("OK");
  } catch (e) {
    console.error("Erro Webhook MP:", e);
    res.status(500).send("Error");
  }
});
app.get("/api/expenses", async (_req, res) => {
  try {
    const expenses = await prisma.expense.findMany({ orderBy: { createdAt: "desc" } });
    res.json(expenses);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.post("/api/expenses", async (req, res) => {
  try {
    const expense = await prisma.expense.create({ data: req.body });
    res.json(expense);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.delete("/api/expenses/:id", async (req, res) => {
  try {
    await prisma.expense.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.get("/api/receipts", async (_req, res) => {
  try {
    const receipts = await prisma.paymentReceipt.findMany({ orderBy: { createdAt: "desc" } });
    res.json(receipts);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.get("/api/receipts/pending", async (_req, res) => {
  try {
    const receipts = await prisma.paymentReceipt.findMany({
      where: { status: "Pendente" },
      orderBy: { createdAt: "desc" }
    });
    res.json(receipts);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.post("/api/receipts", async (req, res) => {
  try {
    const receipt = await prisma.paymentReceipt.create({ data: req.body });
    res.json(receipt);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.put("/api/receipts/:id/approve", async (req, res) => {
  try {
    const { reviewedBy } = req.body;
    const receipt = await prisma.paymentReceipt.update({
      where: { id: req.params.id },
      data: {
        status: "Aprovado",
        reviewedBy: reviewedBy || "Admin",
        reviewedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
    await prisma.payment.update({
      where: { id: receipt.paymentId },
      data: {
        status: "Pago",
        method: "PIX",
        paymentDate: receipt.paidAt
      }
    });
    res.json(receipt);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.put("/api/receipts/:id/reject", async (req, res) => {
  try {
    const { reviewedBy } = req.body;
    const receipt = await prisma.paymentReceipt.update({
      where: { id: req.params.id },
      data: {
        status: "Rejeitado",
        reviewedBy: reviewedBy || "Admin",
        reviewedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
    res.json(receipt);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.get("/api/settings", async (_req, res) => {
  try {
    let settings = await prisma.appSettings.findFirst();
    if (!settings) {
      settings = await prisma.appSettings.create({
        data: {
          pixKey: "55292931829",
          bankName: "Nubank",
          accountName: "Hugo Daniel Ribeiro Nantes",
          defaultMonthlyFee: 50,
          defaultDueDate: 10,
          houseGuidelines: ""
        }
      });
    }
    res.json(settings);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.put("/api/settings", async (req, res) => {
  try {
    let settings = await prisma.appSettings.findFirst();
    if (!settings) {
      settings = await prisma.appSettings.create({ data: req.body });
    } else {
      settings = await prisma.appSettings.update({
        where: { id: settings.id },
        data: req.body
      });
    }
    res.json(settings);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
var readyPromise = null;
function ensureReady() {
  if (!readyPromise) {
    readyPromise = (async () => {
      await initDatabase();
      await seed();
    })().catch((e) => {
      readyPromise = null;
      throw e;
    });
  }
  return readyPromise;
}

// api/index.ts
var ready = null;
async function handler(req, res) {
  try {
    if (!ready) {
      ready = ensureReady();
    }
    await ready;
  } catch (e) {
    res.status(500).json({ status: "error", error: e?.message || "Falha ao iniciar banco de dados" });
    return;
  }
  return app(req, res);
}
export {
  handler as default
};
//# sourceMappingURL=index.js.map
