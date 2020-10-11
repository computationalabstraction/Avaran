// const val = Symbol("Value");
// const unit = v => ({[val]:v});
// const bind = (m,f) => unit(f(m[val]));

// class Monad {}

// class Identity extends Monad
// {
//     constructor(v)
//     {
//         super();
//         this[val] = v;
//         Object.freeze(this);
//     }

//     bind(transformer) 
//     {
//         return new Identity(transformer(this[val]));
//     }

//     static unit(v) 
//     {
//         return new Identity(v);
//     }
// }

// console.log(unit(100));
// console.log(bind(unit(10),v => v));

// console.log(Identity.unit(100).bind(v => v*4).bind(v => console.log(v)));


// const Nothing = Symbol("Nothing");
// class Maybe extends Monad
// {
//     constructor(v) 
//     {
//         super();
//         this[val] = v;
//         Object.freeze(this);
//     }

//     map(transformer) {
//         if(this[val] !== null && this[val] !== undefined)
//         {
//             return new Maybe(transformer(this[val]));
//         }
//         return new Maybe(Nothing);
//     }

//     bind(transformer) 
//     {
//         if(this[val] !== null && this[val] !== undefined)
//         {
//             if(this[val] instanceof Maybe) 
//                 return this[val].bind(transformer);
//             return new Maybe(transformer(this[val]));
//         }
//         return new Maybe(Nothing);
//     }

//     static unit(v) 
//     {
//         return new Maybe(v);
//     }
// }

// console.log(Maybe.unit(10).bind(v => console.log(v)).bind(v => console.log(v)))