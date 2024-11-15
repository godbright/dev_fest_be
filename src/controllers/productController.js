import { getStandardResponse } from "../utils/standardResponse";
import { Product } from "../database/models";

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    // Fetch products from the database
    const products = await Product.findAll();

    // Return a successful response with the list of products
    return getStandardResponse(
      req,
      res,
      200,
      "Products fetched successfully",
      products
    );
  } catch (error) {
    console.error(error);
    return getStandardResponse(
      req,
      res,
      500,
      "An error occurred while fetching products"
    );
  }
};

// Get a product by ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id); // Use findByPk for primary key lookup

    if (!product) {
      return getStandardResponse(req, res, 404, "Product not found");
    }

    return getStandardResponse(
      req,
      res,
      200,
      "Product fetched successfully",
      product
    );
  } catch (error) {
    console.error(error);
    return getStandardResponse(
      req,
      res,
      500,
      "An error occurred while fetching the product"
    );
  }
};

// Create a new product
export const createProduct = async (req, res) => {
  try {
    // Save the new product to the database
    const newProduct = await Product.create(req.body);

    return getStandardResponse(
      req,
      res,
      201,
      "Product created successfully",
      newProduct
    );
  } catch (error) {
    console.error(error);
    return getStandardResponse(
      req,
      res,
      500,
      "An error occurred while creating the product"
    );
  }
};

// Update an existing product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
      return getStandardResponse(req, res, 404, "Product not found");
    }

    // Update the product with new data
    await product.update(req.body);

    return getStandardResponse(
      req,
      res,
      200,
      "Product updated successfully",
      product
    );
  } catch (error) {
    console.error(error);
    return getStandardResponse(
      req,
      res,
      500,
      "An error occurred while updating the product"
    );
  }
};

// Delete a product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
      return getStandardResponse(req, res, 404, "Product not found");
    }

    // Delete the product
    await product.destroy();

    return getStandardResponse(
      req,
      res,
      200,
      "Product deleted successfully",
      product
    );
  } catch (error) {
    console.error(error);
    return getStandardResponse(
      req,
      res,
      500,
      "An error occurred while deleting the product"
    );
  }
};
