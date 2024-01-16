// backend/server.js
const express = require("express");
const { PrismaClient, Prisma } = require("@prisma/client");
const prisma = new PrismaClient();
const app = express();
const port = 3004;
const cors = require("cors");
app.use(cors());

// console.log("con session : ", shopify.authenticate);

// @ts-ignore
app.get("/api/allUsers", async (req, res) => {
  try {
    const allUsers = await getAllUsers();
    res.json(allUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/trialdata", async (req, res) => {
  try {
    const allTrial = await getFreeTrialData();
    res.json(allTrial);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/getAllProductFromDB", async (req, res) => {
  try {
    const allProducts = await getAllProducts();
    res.json(allProducts);
    // console.log("getAllProductFromDB : ", allProducts);
  } catch (error) {
    console.log("get product err :", error);
    res.json({ error });
  }
});

app.get("/api/getAllCategoryFromDB", async (req, res) => {
  try {
    const allCategory = await getAllCategory();
    res.json(allCategory);
  } catch (error) {
    console.log("get product err :", error);
    res.json({ error });
  }
});

app.get("/api/getSizeChartUrl/:productId", async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    const SizeChartUrl = await getSizeChartUrl(productId);
    if (SizeChartUrl !== null) {
      res.json({ SizeChartUrl });
    } else {
      res.status(404).json({ error: "Size chart not found" });
    }
  } catch (error) {
    console.log("get product err url :", error);
    res.json({ error });
  }
});
app.use(express.json());

app.put("/api/updateURL/:category", async (req, res) => {
  const catName = req.params.category;
  const newURL = req.body.newData;
  // console.log("body",req);
  // console.log("cat----", catName, "", newURL);
  try {
    // Check if category exists
    const existingURL = await prisma.category_sizing.findUnique({
      // @ts-ignore
      where: { category: catName },
    });

    if (!existingURL) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the url's data
    const updatedUser = await prisma.category_sizing.update({
      // @ts-ignore
      where: { category: catName },
      data: {
        size_chart_url: newURL,
      },
    });

    res.json({ message: "category data updated successfully", category: updatedUser });
  } catch (error) {
    console.error("Error updating user data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//get user data
async function getAllUsers() {
  try {
    const allUsers = await prisma.tab_employee.findMany();
    return allUsers;
  } finally {
    await prisma.$disconnect();
  }
}

// 14 day free trial
async function getFreeTrialData() {
  try {
    const allTrial = await prisma.freetrial.findMany();
    return allTrial;
  } finally {
    await prisma.$disconnect();
  }
}

// get all products
async function getAllProducts() {
  try {
    const allProducts = await prisma.product.findMany();
    // Converting BigInt values to string to resolve serialization problem
    const productsWithStrings = allProducts.map((product) => ({
      ...product,
      pid: String(product.pid),
    }));
    return productsWithStrings;
  } finally {
    await prisma.$disconnect();
  }
}

// get all category
async function getAllCategory() {
  try {
    const allCategory = await prisma.category_sizing.findMany();
    return allCategory;
  } finally {
    await prisma.$disconnect();
  }
}

//get size chart url based on product id
async function getSizeChartUrl(productId) {
  try {
    const result = await prisma.$queryRaw(Prisma.sql`SELECT cs.size_chart_url
                                              FROM product p
                                              JOIN category_sizing cs ON p.category = cs.category
                                              WHERE p.pid = ${productId};`);

    console.log("ProductId:", productId);
    console.log("SQL Query:", result);

    // @ts-ignore
    return result && result.length > 0
      ? result[0].size_chart_url
      : (console.log("No size chart found for product ID:", productId), null);
  } catch (error) {
    console.error("Error executing raw query:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
