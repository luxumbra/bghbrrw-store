import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import { BRAND_NAME, CONTACT_EMAIL } from "../../../utils/constants";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const stockLocationService = req.scope.resolve(Modules.STOCK_LOCATION);
  const locations = await stockLocationService.listStockLocations({}, { relations: ["address"] });
  
  const primaryLocation = locations.find(loc => loc.name === "The Burrow") || locations[0];
  
  res.json({
    company: {
      name: BRAND_NAME,
      email: CONTACT_EMAIL,
      location: primaryLocation ? {
        name: primaryLocation.name,
        address: primaryLocation.address
      } : null
    }
  });
}