/// <reference path="../pb_data/types.d.ts" />

// Aligns the Blogs collection with the fields the website reads and writes
// (src/types/blog.ts and src/lib/server/admin-schemas.ts in puerto-rico-speech-hub).
//
// Written to work against the live schema, which was partly edited from the admin UI
// and does not match the earlier migrations: every step checks the current state first.

const RENAMES = [
  ["Title_ES", "title_es"],
  ["Title_EN", "title_en"],
  ["Content_ES", "content_es"],
  ["Content_EN", "content_en"],
];

migrate((app) => {
  const ACCENTS = {
    á: "a", à: "a", ä: "a", â: "a", é: "e", è: "e", ë: "e", ê: "e",
    í: "i", ì: "i", ï: "i", î: "i", ó: "o", ò: "o", ö: "o", ô: "o",
    ú: "u", ù: "u", ü: "u", û: "u", ñ: "n", ç: "c",
  };
  const slugify = (value) => {
    const base = String(value || "")
      .toLowerCase()
      .replace(/[áàäâéèëêíìïîóòöôúùüûñç]/g, (ch) => ACCENTS[ch])
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80)
      .replace(/-+$/g, "");
    return base || "articulo";
  };

  const collection = app.findCollectionByNameOrId("Blogs");

  for (const [from, to] of RENAMES) {
    const field = collection.fields.getByName(from);
    if (field && !collection.fields.getByName(to)) {
      field.name = to;
    }
  }

  const missing = [
    new TextField({ name: "slug", max: 200 }),
    new TextField({ name: "excerpt_es", max: 500 }),
    new TextField({ name: "excerpt_en", max: 500 }),
    new URLField({ name: "image_url" }),
    new DateField({ name: "published_at" }),
    new BoolField({ name: "is_published" }),
  ];
  for (const field of missing) {
    if (!collection.fields.getByName(field.name)) {
      collection.fields.add(field);
    }
  }

  // Empty slugs are allowed while an article is a draft.
  collection.addIndex("idx_blogs_slug", true, "slug", "slug != ''");

  app.save(collection);

  // Existing articles: give each a unique slug and publish it, since before this
  // migration there was no draft state and every article was meant to be public.
  const used = {};
  const records = app.findAllRecords("Blogs");
  for (const record of records) {
    if (record.getString("slug")) used[record.getString("slug")] = true;
  }
  for (const record of records) {
    let changed = false;

    if (!record.getString("slug")) {
      const base = slugify(record.getString("title_es") || record.getString("title_en"));
      let slug = base;
      for (let n = 2; used[slug]; n++) slug = `${base}-${n}`;
      used[slug] = true;
      record.set("slug", slug);
      changed = true;
    }

    if (!record.getString("published_at")) {
      record.set("published_at", record.getString("created"));
      changed = true;
    }

    if (!record.getBool("is_published") && !record.getString("deleted_at")) {
      record.set("is_published", true);
      changed = true;
    }

    if (changed) app.save(record);
  }
}, (app) => {
  const collection = app.findCollectionByNameOrId("Blogs");

  collection.removeIndex("idx_blogs_slug");
  for (const name of ["slug", "excerpt_es", "excerpt_en", "image_url", "published_at", "is_published"]) {
    collection.fields.removeByName(name);
  }
  for (const [from, to] of RENAMES) {
    const field = collection.fields.getByName(to);
    if (field && !collection.fields.getByName(from)) {
      field.name = from;
    }
  }

  app.save(collection);
});
