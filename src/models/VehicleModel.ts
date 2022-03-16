import { Document, Schema } from "mongoose";

export enum FuelType {
    PETROL = "PETROL",
    DIESEL = "DIESEL",
    GPL = "GPL",
}

export interface Vehicle {
    plate: string;
    manufacturer: string;
    cc: number;
    carModel: string;
    seats: number;
    fuel: FuelType;
    km?: number;
    matriculationDate: Date;
    color: string;
    hasABS: boolean;
    notes: string;
    isUsed?: boolean;
}
export interface VehicleDocument extends Vehicle, Document {}

export const VehicleSchema = new Schema<Vehicle>({
    plate: {
        type: String,
    },
    manufacturer: {
        type: String,
    },
    cc: {
        type: Number,
    },
    carModel: {
        type: String,
    },
    seats: {
        type: Number,
    },
    fuel: {
        type: String,
        enum: [FuelType.DIESEL, FuelType.GPL, FuelType.PETROL],
    },
    km: {
        type: Number,
    },
    matriculationDate: {
        type: Date,
    },
    color: {
        type: String,
    },
    hasABS: {
        type: Boolean,
    },
    notes: {
        type: String,
    },
    isUsed: {
        type: Boolean,
        default: false,
    },
});