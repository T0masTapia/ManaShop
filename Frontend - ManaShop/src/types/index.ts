export type Game = {
    id: number;  
    titulo: string;
    precio: number;
    descrip: string;
    image: string;
    stock: number;
}

export type GameInCart = Game & {
    quantity : number
} 

export type Usuario = {
    nombre: string,
    email: string,
    password: string,
    foto: string
}