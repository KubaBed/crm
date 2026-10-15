import { Inject } from "@nestjs/common";
import { Input, Query, Router, UseMiddlewares } from "nestjs-trpc";
import { AuthMiddleware } from "../trpc/middlewares/auth.middleware";
import { restMeta } from "../trpc/openapi";
import { dealOffersInput, dealOffersOutput } from "./offers.contracts";
import { OffersService } from "./offers.service";

@Router({ alias: "offers" })
@UseMiddlewares(AuthMiddleware)
export class OffersRouter {
	constructor(@Inject(OffersService) private readonly offers: OffersService) {}

	@Query({
		input: dealOffersInput,
		output: dealOffersOutput,
		meta: restMeta("GET", "/deals/{id}/offers", ["Deals"]),
	})
	async forDeal(@Input("id") id: string) {
		return this.offers.forDeal(id);
	}
}
