// Add Fantasy Land and Static Land support.
const { sum, tagged } = require("./styp");

// Free Monad
const Free = sum("Free", {
    Return:["v"],
    Suspend:["f"]
});

// Either Monad
// Right biased
const Either = sum("Either", {
    Left:["v"],
    Right:["v"]
});

Either.prototype.map = function(transformer) {
    return this.cata({
        Right: ({ v }) => Either.Right(transformer(v)),
        Left: () => this
    });
};

Either.prototype.leftMap = function(transformer) {
    return this.cata({
        Right: () => this,
        Left: ({ v }) => Either.Left(transformer(v))
    });
};

Either.prototype.flatMap = function(transformer) {
    return this.cata({
        Right: ({ v }) => Either.is(v)?v.flatMap(transformer):Either.Right(transformer(v)),
        Left: () => this
    });
};

Either.prototype.catchMap = function(transformer) {
    return this.cata({
        Right: () => this,
        Left: ({ v }) => Either.is(v)?v.flatMap(transformer):Either.Left(transformer(v))
    });
};

Either.prototype.cataM = function(ifRight, ifLeft) {
    return this.cata({
        Right: ({ v }) => ifRight(v),
        Left: ({ v }) => ifLeft(v)
    });
};

Either.prototype.bimap = function(rTransformer,lTransformer) {
    return this.cata({
        Right: ({ v }) => Either.Right(rTransformer(v)),
        Left: ({ v }) => Either.Left(lTransformer(v))
    });
};

Either.prototype.swap = function() {
    return this.cata({
        Right: ({ v }) => Either.Left(v),
        Left: ({ v }) => Either.Right(v)
    });
};

Either.prototype.isRight = function() {
    return Either.Right.is(this);
};

Either.prototype.isLeft = function() {
    return Either.Left.is(this);
};

Either.prototype.foldLeft = function(inital,transformer) {
    return this.cata({
        Right: ({ v }) => transformer(inital,v),
        Left: () => inital
    });
};

Either.prototype.foldRight = function(inital,transformer) {
    return this.cata({
        Right: ({ v }) => transformer(v,inital),
        Left: () => inital
    });
};

Either.prototype.right = function() {
    return this.cata({
        Right: ({ v }) => v,
        Left: () => { throw new Error("Either.Right was expected") }
    });
};

Either.prototype.left = function() {
    return this.cata({
        Right: () => { throw new Error("Either.Left was expected") },
        Left: ({ v }) => v
    });
};

Either.prototype.contains = function(val) {
    return this.cata({
        Right: ({ v }) => v == val,
        Left: ({ v }) => v == val
    });
};

// Reader Monad
const Reader = tagged("Reader", ["action"]);

Reader.prototype.map = function(transformer) {
    return Reader((dep) => transformer(this.run(dep)));
};

Reader.prototype.flatMap = function(transformer) {
    return Reader((dep) => {
        const out = this.run(dep);
        if(Reader.is(out)) return out.flatMap(transformer);
        const tval = transformer(out);
        return Reader.is(tval)?transformer(out).run(dep):tval;
    });
};

Reader.prototype.run = function(dep) {
    return this.action(dep);
};

// IO Monad
const IO = tagged("IO", ["effect"]);

IO.prototype.map = function(transformer) {
    return IO(() => transformer(this.run()));
};

IO.prototype.flatMap = function(transformer) {
    return IO(() => {
        const out = this.run();
        if(IO.is(out)) return out.flatMap(transformer);
        const tval = transformer(out);
        return IO.is(tval)?transformer(out).run():tval;
    });
};

IO.prototype.run = function() {
    return this.effect();
};

// Maybe Monad
const Maybe = sum("Maybe", {
    Some:["v"],
    None:[]
});

Maybe.prototype.map = function(transformer) {
    return this.cata({
        Some: ({ v }) => Maybe.Some(transformer(v)),
        None: () => this
    });
};

Maybe.prototype.flatMap = function(transformer) {
    return this.cata({
        Some: ({ v }) => Maybe.is(v)?v.flatMap(transformer):Maybe.Some(transformer(v)),
        None: () => this
    });
};

Maybe.prototype.catchMap = function(other) {
    return this.cata({
        Some: () => this,
        None: () => other()
    });
};

Maybe.prototype.fold = function(def, transformer) {
    return this.cata({
        Some: ({ v }) => transformer(v),
        None: () => def
    });
};

Maybe.prototype.foldLeft = function(def, transformer) {
    return this.cata({
        Some: ({ v }) => transformer(def,v),
        None: () => def
    });
};

Maybe.prototype.isSome = function() {
    return Maybe.Some.is(this);
};

Maybe.prototype.isNone = function() {
    return Maybe.None.is(this);
};

Maybe.prototype.some = function() {
    return this.cata({
        Some: ({ v }) => v,
        None: () => { throw new Error("Maybe.some: No value present"); }
    });
};

Maybe.prototype.orSome = function(def) {
    return this.cata({
        Some: ({ v }) => v,
        None: () => def
    });
};

Maybe.prototype.orLazy = function(def) {
    return this.cata({
        Some: ({ v }) => v,
        None: () => def()
    });
};

Maybe.prototype.orNull = function() {
    return this.cata({
        Some: ({ v }) => v,
        None: () => null
    });
};

Maybe.prototype.orUndefined = function() {
    return this.cata({
        Some: ({ v }) => v,
        None: () => undefined
    });
};

Maybe.prototype.orElse = function(other) {
    return this.cata({
        Some: () => this,
        None: () => other
    });
};

Maybe.prototype.orNoneif = function(bool) {
    return bool? Maybe.None: this;
};

Maybe.prototype.do = function(fn) {
    this.cata({
        Some: ({ v }) => fn(v),
        None: () => {}
    });
};

Maybe.prototype.orElseRun = function(fn) {
    this.cata({
        Some: () => {},
        None: () => fn()
    });
};

Maybe.prototype.filter = function(cond) {
    return this.cata({
        Some: ({ v }) => cond(v)? this: Maybe.None,
        None: () => this
    });
};

Maybe.prototype.toArray = function() {
    return this.cata({
        Some: ({ v }) => [v],
        None: () => []
    });
};

Maybe.prototype.toBool = function() {
    return this.cata({
        Some: () => true,
        None: () => false
    });
};

Maybe.prototype.cataM = function(ifSome, ifNone) {
    return this.cata({
        Some: ({ v }) => ifSome(v),
        None: ifNone
    });
};

const avaran = Object.freeze({
    Maybe: Maybe,
    Either: Either,
    IO:IO,
    Reader:Reader,
    Free:Free
});

if(typeof module != "undefined") module.exports = avaran;