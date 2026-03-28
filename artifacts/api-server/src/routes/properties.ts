import { Router, type IRouter } from "express";
import { db, propertiesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreatePropertyBody, UpdatePropertyBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/properties", async (_req, res) => {
  const properties = await db.select().from(propertiesTable).orderBy(propertiesTable.createdAt);
  res.json(properties.map(p => ({
    ...p,
    price: parseFloat(p.price),
    area: parseFloat(p.area),
    createdAt: p.createdAt.toISOString(),
  })));
});

router.post("/properties", async (req, res) => {
  const body = CreatePropertyBody.parse(req.body);
  const [property] = await db.insert(propertiesTable).values({
    name: body.name,
    location: body.location,
    price: String(body.price),
    area: String(body.area),
    bedrooms: body.bedrooms,
    bathrooms: body.bathrooms,
    description: body.description,
    images: body.images,
    category: body.category,
    available: body.available,
  }).returning();
  res.status(201).json({
    ...property,
    price: parseFloat(property.price),
    area: parseFloat(property.area),
    createdAt: property.createdAt.toISOString(),
  });
});

router.get("/properties/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [property] = await db.select().from(propertiesTable).where(eq(propertiesTable.id, id));
  if (!property) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({
    ...property,
    price: parseFloat(property.price),
    area: parseFloat(property.area),
    createdAt: property.createdAt.toISOString(),
  });
});

router.put("/properties/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const body = UpdatePropertyBody.parse(req.body);
  const [property] = await db.update(propertiesTable).set({
    name: body.name,
    location: body.location,
    price: body.price !== undefined ? String(body.price) : undefined,
    area: body.area !== undefined ? String(body.area) : undefined,
    bedrooms: body.bedrooms,
    bathrooms: body.bathrooms,
    description: body.description,
    images: body.images,
    category: body.category,
    available: body.available,
  }).where(eq(propertiesTable.id, id)).returning();
  if (!property) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({
    ...property,
    price: parseFloat(property.price),
    area: parseFloat(property.area),
    createdAt: property.createdAt.toISOString(),
  });
});

router.delete("/properties/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(propertiesTable).where(eq(propertiesTable.id, id));
  res.status(204).send();
});

export default router;
