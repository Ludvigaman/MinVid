import { Guid } from "guid-typescript";

export class Video {
    id: Guid;
    title: string;
    url: string;
    tags: string[];
    description: string;

    constructor(title: string, url: string, description: string, tags: string[]){
        this.id = Guid.create();
        this.title = title;
        this.url = url;
        this.description = description;
        this.tags = tags;
    }
}