import { Module } from "@nestjs/common";
import { TrpcModule } from "../trpc/trpc.module";
import { OffersController } from "./offers.controller";
import { OffersRouter } from "./offers.router";
import { OffersService } from "./offers.service";

@Module({
	imports: [TrpcModule],
	controllers: [OffersController],
	providers: [OffersService, OffersRouter],
	exports: [OffersService],
})
export class OffersModule {}
