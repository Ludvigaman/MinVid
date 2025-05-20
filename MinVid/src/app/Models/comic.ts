export class Comic {
    id: string;
    name: string;
    description: string;
    artist: string;
    numberOfPage: number;
    tags: string[]; 
    uploadDate: Date;

    constructor(id: string, name: string, description: string, artist: string, numberOfPages: number, tags: string[]){
        this.id = id;
        this.name = name;
        this.description = description;
        this.artist = artist;
        this.numberOfPage = numberOfPages;
        this.tags = tags;
        this.uploadDate = new Date();
    }
}