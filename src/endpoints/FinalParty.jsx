export default function FinalParty() {
    const queryParameters = new URLSearchParams(window.location.search);
    const fp = queryParameters.get("args") ?? "";

    let args = fp.split(" ");

    console.log(args);

    if (args.length < 1) return (<>I have nothing do to with an empty command.</>);

    const availableVersions = ['pc', 'psx', 'psja', 'jphd'];

    let version = "pc";
    let pattern = "";
    let holywar = false;

    // If arg[0] doesn't match any available version, version was probably left out.
    if (!availableVersions.includes(args[0].toLowerCase())) {
        pattern = args[0].toLowerCase();
    } else {
        version = args[0].toLowerCase();
        pattern = args[1].toLowerCase();
    }

    // The last element dictates whether we have holy war
    if (args.slice(-1)[0].toLowerCase() === "hw") {
        holywar = true;
    }

    if (pattern.length != 12) return (<>I expected 12 movements and got {pattern.length}, try again.</>);

    // Recreating the whole script from scratch using the Ruby script for logic reference.
    let options = {
        // Target party. Multiple settings are possible.
        targets: [
            ["irvine", "squall", "zell"],
            ["irvine", "squall", "selphie"],
            ["irvine", "squall", "rinoa"],
            ["irvine", "zell", "quistis"],
            ["irvine", "zell", "selphie"],
            ["irvine", "zell", "rinoa"],
            ["irvine", "selphie", "rinoa"],
            ["irvine", "selphie", "quistis"],
            ["irvine", "quistis", "rinoa"],
        ],

        // Index used as a search reference
        base: 12,

        // Search for this width with base as the center
        width: 9000,

        // reverse, ascending, descending, other
        order: "reverse",

        // Perform a hard reset immediately before (DISC4 start data)
        hardware_reset: false,

        // Idling duration when traveling the final map at the fastest speed
        // ps2fast_ja:22.0, ps2fast_na:22.7?, pc-fr-2013:21.5,
        last_map_duration: 21.5,

        // If last_map_duration% 0.5 is within this range, do not wait on the last map
        last_map_safe_range: [0.10, 0.20, 0.30, 0.40],

        // Squall movements
        movements_size: pattern.length,
    }

    // Get the proper version
    switch (version) {
        case "psx":
            options.last_map_duration = 22.7;
            break;
        case "psja":
            options.last_map_duration = 22;
            break;
        case "jphd":
            options.last_map_duration = 21.2;
            break;
        case "pc":
        default:
            options.last_map_duration = 21.5;
    }

    options.holywar = holywar;

    // Calculate the table and manip
    let manip = new FinalPartyManip(options);
    let last_party = manip.search_last_party(pattern);

    if (!last_party) return ("No match found D:");

    let response = `(${version.toUpperCase()}${holywar ? " / Holy War" : ""}) `;
    last_party.forEach((party) => {
        // Sort by number of draws
        party.target_offset_tbl.sort((a, b) => a.offset - b.offset); // b - a for reverse sort

        // If Holy War is checked, only show results with the fastest attackers
        if (options.holywar === true) {
            let holyParty = ['selphie', 'zell', 'irvine', 'squall'];

            party.target_offset_tbl = party.target_offset_tbl.filter(val => {
                return holyParty.includes(val.party[0]) && holyParty.includes(val.party[1]) && holyParty.includes(val.party[2]);
            })
        }

        let tbl = party.target_offset_tbl;

        response += `+${tbl[0].offset}: ${tbl[0].party.join("/")}`;

        if (party.target_offset_tbl.length > 1) {
            response += ` // +${tbl[1].offset}: ${tbl[1].party.join("/")}`;
        }
    })

    return (<>{response}</>);
}

/******** HELPER FUNCTIONS ********/
function range(start, end) {
    return Array(end - start + 1).fill().map((_, idx) => start + idx)
}

function isEven(num) {
    return num % 2 === 0;
}

function ArrayCompare(a, b) {
    a.sort();
    b.sort();
    var i = a.length;
    while (i--) {
        if (a[i] !== b[i]) return false;
    }
    return true
}

// https://stackoverflow.com/questions/14718561/how-to-check-if-a-number-is-between-two-values
Number.prototype.between = function (a, b) {
    var min = Math.min.apply(Math, [a, b]),
        max = Math.max.apply(Math, [a, b]);
    return this >= min && this <= max;
};

class RNG {
    constructor() {
        this.Current_Rng = 1;
    }

    CreateRand(seed) {
        /**
         * https://en.wikipedia.org/wiki/Linear_congruential_generator
         * FF8's Field RNG is an LCR with:
         * a = 0x41C64E6D = 1103515245
         * b = 0x3039     = 12345
         * m = 0xffffffff = 2^32
         * NewRNG = (OldRNG * a + b) mod m
         **/

        // We use bigints here because JS sucks at large number math
        var a = BigInt(0x41C64E6D);
        var b = BigInt(0x3039);
        var m = BigInt(0xffffffff);

        // https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
        var z = BigInt(seed) || Math.floor(Math.random() * (0xffffffff + 1));
        let rngCalc = (z * a + b) & m;

        // The result is back within the realm of JS being able to handle it, so convert back to a regular number.
        let numValue = Number(rngCalc);
        return numValue;
    }

    NextRng() {
        let oldRng = this.Current_Rng;
        // Progress the RNG for the next call.
        this.Current_Rng = this.CreateRand(this.Current_Rng);
        return oldRng;
    }

    // Random number generation rand(0..32767)
    nxt() {
        return (this.NextRng() >> 16) & 32767
    }

    // Returns the upper 2nd byte of the random number state rand(0..255)
    next_1b() {
        return this.nxt() & 255
    }

}

class Party {
    constructor(arr) {
        return arr.map(x => this.x2char(x));
    }

    x2char(x) {
        switch (x) {
            case 0:
            case "sq":
            case "squall":
                return "squall";

            case 1:
            case "ze":
            case "zell":
                return "zell";

            case 2:
            case "ir":
            case "irvine":
                return "irvine";

            case 3:
            case "qu":
            case "quistis":
                return "quistis";

            case 4:
            case "ri":
            case "rinoa":
                return "rinoa";

            case 5:
            case "se":
            case "selphie":
                return "selphie"
        }
    }
}

class FinalPartyManip {

    constructor(options) {
        // Target party. Multiple settings are possible.
        this.targets = options.targets;

        // Index used as a search reference
        this.base = options.base || 2800;

        // Search for this width with base as the center
        this.width = options.width || 9000;

        // reverse, ascending, descending, other
        this.order = options.order || "reverse";

        // Perform a hard reset immediately before (DISC4 start data)
        this.hardware_reset = options.hardware_reset || false;

        // Idling duration when traveling the final map at the fastest speed
        // ps2fast_ja:22.0, ps2fast_na:22.7?, pc-fr-2013:21.5,
        this.last_map_duration = options.last_map_duration || 21.5;

        // If last_map_duration% 0.5 is within this range, do not wait on the last map
        this.last_map_safe_range = options.last_map_safe_range || [0.10, 0.20, 0.30, 0.40];

        // Squall movement upper limit
        this.movements_size = options.movements_size || 12;

        // Goal party
        let rem = options.last_map_duration % 0.5;

        // Time to extend on the final map
        let minSafe = Math.min(...options.last_map_safe_range);
        let maxSafe = Math.max(...options.last_map_safe_range)
        let last_map_extra = rem.between(minSafe, maxSafe) ? 0 : rem < minSafe ? 0.25 - rem : 0.75 - rem;

        // Offset from the last random number to the random number applied to the final party selection
        this.party_rnd_offset = Math.floor((this.last_map_duration + last_map_extra) / 0.5) + 1

        // Start!
        this.init();
    }

    init() {
        let start_index = this.hardware_reset ? 15 : this.base;
        let orderArr = range(0, this.width / 2);

        let order = orderArr.map(offset => (
            [start_index + offset, start_index - offset]
        )).flat().filter(idx => idx >= 0);

        // Unique values only, please.
        order = [...new Set(order)];

        // If our width is an even number, let's remove the top index.
        if (isEven(this.width)) {
            const max = Math.max(...order);
            order = order.filter(number => number !== max)
        }

        let min = Math.min(...order);
        let max = Math.max(...order);

        switch (this.order) {
            case "reverse":
                order.reverse();
                break;

            case "ascending":
                order.sort();
                break;

            case "descending":
                order.sort().reverse();
        }

        // Build Tables
        this.table = this.make_last_party_table(min, max);
    }

    make_last_party_table(from, to) {
        let rng = new RNG();

        // Take a good margin
        let margin = 250;

        // Subtract 1. I don't know why. Don't ask.
        let size = to + margin;

        // Random number state
        // Get the first n RNG states, where n is our search window size.
        let rng_state_arr = range(0, size);  //0 - (1015+250)
        rng_state_arr = rng_state_arr.map(() => rng.NextRng());

        // Random numbers actually used (0..255)
        let source_rng = new RNG();
        let source_arr = range(0, size);  //0 - (1015+250)
        source_arr = source_arr.map(() => source_rng.next_1b());

        // Direction of movement of squall during time compression
        let direction_arr = source_arr.map(v => ["8", "2", "4", "6"][v & 3]);

        // Party when you go the fastest on the final map
        let lastPartySize = size - this.party_rnd_offset;
        let party_arr = Array.from({ length: lastPartySize }, (_val, idx) => this.last_party(source_arr[idx + this.party_rnd_offset]))

        // Array of offset tables to the nearest target
        let target_offset_tbl_arr = this.GenerateOffsetTable(party_arr);

        // old: range(0, to).map((idx) ...
        let table = range(from, to).map((idx) => {
            if (!idx.between(from, to)) return null;

            let r = {
                index: idx,

                // source
                source: source_arr[idx],

                // Random number state - convert to hex value
                rng_state: rng_state_arr[idx].toString(16),

                // !party
                party: party_arr[idx],

                // movements
                movements: ((arr) => {
                    let first = Math.max(0, idx - (this.movements_size - 1));
                    let last = idx + 1;
                    return arr.slice(first, last).join("");
                })(direction_arr),

                // Offset to the target party
                target_offset_tbl: this.targets.map(target_party => (
                    {
                        party: target_party,
                        offset: target_offset_tbl_arr[idx][target_party]
                    }
                ))
            };

            // Nearest target
            // https://stackoverflow.com/questions/53097817/javascript-objects-array-filter-by-minimum-value-of-an-attribute
            let min = Math.min(...(r.target_offset_tbl).map(item => item.offset))
            r.nearest_target = (r.target_offset_tbl).find(item => item.offset === min).party.join("/");

            return r;
        });

        return table;
    }

    GenerateOffsetTable(party_arr) {
        let targets = this.targets;

        //party_arr is an array of arrays
        let r = [];
        party_arr.reverse();

        party_arr.forEach((curr_party, i) => {

            // Instantiate object
            r[i] = {};

            if (i > 0) {
                // Increment the number for each party from the last index
                let lastValue = r[i - 1];

                // eslint-disable-next-line no-unused-vars
                Object.keys(lastValue).map((key, _index) => {
                    r[i][key] = lastValue[key] + 1;
                });
            }

            // If this party combination has all of our target members, reset its counter to 0        
            targets.forEach(elem => {
                let goodParty = ArrayCompare(curr_party, elem);
                if (goodParty)
                    r[i][curr_party] = 0;
            });
        });

        r.reverse();
        return r;
    }

    search_last_party(pattern) {
        // let start_index = hardware_reset ? options.base : 15;

        pattern = pattern.toLowerCase();

        // replace WASD pattern with numbers
        pattern = pattern.replaceAll('s', '2');
        pattern = pattern.replaceAll('a', '4');
        pattern = pattern.replaceAll('d', '6');
        pattern = pattern.replaceAll('w', '8');
        pattern = pattern.replaceAll('k', '2');
        pattern = pattern.replaceAll('j', '4');
        pattern = pattern.replaceAll('l', '6');
        pattern = pattern.replaceAll('i', '8');

        // Idea Credit: Kiitoksia
        // Replace all non-permitted characters with wildcards.
        let permittedCharacters = ['w', 'a', 's', 'd', 'i', 'j', 'k', 'l', '2', '4', '6', '8'];

        pattern = pattern.replace(new RegExp(`[^${permittedCharacters.join('')}]`, 'g'), '5');

        // Look for a data table matching the submitted pattern
        let data = this.table.filter(item => new RegExp('^' + pattern.replace(/5/g, '.*') + '$').test(item.movements));

        // If we find a match for the pattern
        if (data.length > 0) {
            /*
            data.forEach(row => {
                row.diff = row.index - start_index;
            });
            */

            // Remove any null sets from the result array
            // https://stackoverflow.com/questions/281264/remove-empty-elements-from-an-array-in-javascript
            data.filter(n => n);

            return data;
        } else {
            return false;
        }
    }
    // Final party selection
    // Numbers are references to specific party members
    last_party(rnd) {
        let tbl = [
            [0, 1, 2],
            [0, 1, 4],
            [0, 1, 5],
            [0, 1, 3],
            [0, 2, 4],
            [0, 2, 5],
            [0, 2, 3],
            [0, 4, 5],
            [0, 4, 3],
            [0, 5, 3],
            [1, 2, 4],
            [1, 2, 5],
            [1, 2, 3],
            [1, 4, 5],
            [1, 4, 3],
            [1, 5, 3],
            [2, 4, 5],
            [2, 4, 3],
            [2, 5, 3],
            [4, 5, 3]
        ];

        let idx = Math.floor(rnd / 13);
        return new Party(tbl[idx]);
    }
}