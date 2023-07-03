const express = require("express");
const controllers = require("../../controllers/contactsControllers");

const {
  validateBody,
  isValidId,
  authentificate,
} = require("../../middlewares");

const { schemas } = require("../../models/contact");
const router = express.Router();

// GET all contacts
router.get("/", authentificate, controllers.getAll);

// GET contact byID
router.get("/:contactId", authentificate, isValidId, controllers.getById);

// Add contact
router.post(
  "/",
  authentificate,
  validateBody(schemas.addSchema),
  controllers.add
);

// Delete contact
router.delete("/:contactId", authentificate, isValidId, controllers.deleteById);

// Update contact

router.put(
  "/:contactId",
  authentificate,
  isValidId,
  validateBody(schemas.updateContactSchema),
  controllers.updateById
);

// Update favorite

router.patch(
  "/:contactId/favorite",
  authentificate,
  isValidId,
  validateBody(schemas.updateFavoriteSchema),
  controllers.updateFavorite
);

module.exports = router;
