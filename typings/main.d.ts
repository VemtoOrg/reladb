declare namespace _default {
    export { Model };
    export { Query };
    export { HasMany };
    export { Command };
    export { Resolver };
    export { Database };
    export { BelongsTo };
    export { RAMStorage };
    export { LocalStorage };
    export { Relationship };
}
export default _default;
import Model from "./src/Model";
import Query from "./src/Query";
import Command from "./src/Command";
import Resolver from "./src/Resolver";
import Database from "./src/Database";
import HasMany from "./src/Relationships/HasMany";
import RAMStorage from "./src/Drivers/RAMStorage";
import BelongsTo from "./src/Relationships/BelongsTo";
import LocalStorage from "./src/Drivers/LocalStorage";
import Relationship from "./src/Relationships/Relationship";
//# sourceMappingURL=main.d.ts.map