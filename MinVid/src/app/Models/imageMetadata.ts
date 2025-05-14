import { Guid } from "guid-typescript";

export class ImageMetadata {
    id: string;
    format: string;
    tags: string[]; 

    constructor(format: string, tags: string[]){
        this.format = format;
        this.tags = tags;
    }
}