declare interface Image {
    path: string,
    name: string,
    description: string
}

declare interface ImagesContainer extends Array<Image> { }

declare interface Model {
    name: string,
    description: string,
    dateCreated: string,
    lastModified: string,
    numImages: string,
    accuracy: string,
    images: ImagesContainer
}
