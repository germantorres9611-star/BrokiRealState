import { Router, type IRouter } from "express";
import { db, contentTable } from "@workspace/db";
import { UpdateContentBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/content", async (_req, res) => {
  const rows = await db.select().from(contentTable).limit(1);
  if (rows.length === 0) {
    const [defaultContent] = await db.insert(contentTable).values({}).returning();
    res.json(defaultContent);
    return;
  }
  res.json(rows[0]);
});

router.put("/content", async (req, res) => {
  const body = UpdateContentBody.parse(req.body);
  const rows = await db.select().from(contentTable).limit(1);
  if (rows.length === 0) {
    const [content] = await db.insert(contentTable).values(body).returning();
    res.json(content);
    return;
  }
  const [content] = await db.update(contentTable).set(body).returning();
  res.json(content);
});

export default router;
