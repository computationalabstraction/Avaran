// Add Fantasy Land and Static Land support.
const { sum, tagged } = require("./styp");

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
    })
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
    })
}

Maybe.prototype.orSome = function(def) {
    return this.cata({
        Some: ({ v }) => v,
        None: () => def
    })
};

Maybe.prototype.orLazy = function(def) {
    return this.cata({
        Some: ({ v }) => v,
        None: () => def()
    })
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
}

Maybe.prototype.orElse = function(other) {
    return this.cata({
        Some: () => this,
        None: () => other
    });
}

Maybe.prototype.orNoneif = function(bool) {
    return bool? Maybe.None: this;
};

Maybe.prototype.do = function(fn) {
    this.cata({
        Some: ({ v }) => fn(v),
        None: () => {}
    })
};

Maybe.prototype.orElseRun = function(fn) {
    this.cata({
        Some: () => {},
        None: () => fn()
    });
}

Maybe.prototype.filter = function(cond) {
    return this.cata({
        Some: ({ v }) => cond(v)? this: Maybe.None,
        None: () => this
    });
}

Maybe.prototype.toArray = function() {
    return this.cata({
        Some: ({ v }) => [v],
        None: () => []
    });
}

Maybe.prototype.toBool = function() {
    return this.cata({
        Some: () => true,
        None: () => false
    });
}

Maybe.prototype.cataM = function(ifSome, ifNone) {
    return this.cata({
        Some: ({ v }) => ifSome(v),
        None: ifNone
    });
}