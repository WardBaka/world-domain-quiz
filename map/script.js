

// =========================
// MAPTILER CONFIGURATION
// =========================

const MAPTILER_KEY = "MkP4zsc7wuOVKFVNZhP5";

maptilersdk.config.apiKey =
    MAPTILER_KEY;


// =========================
// PAGE ELEMENTS
// =========================

const mapSidebar =
    document.getElementById(
        "mapSidebar"
    );

const closeSidebarButton =
    document.getElementById(
        "closeSidebar"
    );

const backButton =
    document.getElementById(
        "backButton"
    );

const mapStatus =
    document.getElementById(
        "mapStatus"
    );

const mapSearch =
    document.getElementById(
        "mapSearch"
    );

const clearSearchButton =
    document.getElementById(
        "clearSearch"
    );

const searchResults =
    document.getElementById(
        "searchResults"
    );

const countryBreadcrumb =
    document.getElementById(
        "countryBreadcrumb"
    );

const regionBreadcrumb =
    document.getElementById(
        "regionBreadcrumb"
    );


// =========================
// MAP STATE
// =========================

const WORLD_CENTER = [
    10,
    20
];

const WORLD_ZOOM = 1.7;

let selectedCountry = null;
let selectedRegion = null;


let countryData = [];

async function loadCountryData() {
    try {
        const response =
            await fetch("countries.json");

        if (!response.ok) {
            throw new Error(
                "Could not load countries.json"
            );
        }

        const result =
            await response.json();

        if (!Array.isArray(result)) {
            throw new Error(
                "countries.json must contain an array."
            );
        }

        countryData = result;
    }
    catch (error) {
        console.error(
            "Country data error:",
            error
        );

        countryData = [];
    }
}


// =========================
// CREATE MAP
// =========================

const map =
    new maptilersdk.Map({
        container: "map",

        style:
            "https://api.maptiler.com/maps/base-v4/style.json?key=" +
            MAPTILER_KEY,

        center: WORLD_CENTER,

        zoom: WORLD_ZOOM,

        minZoom: 1,

        maxZoom: 18,

        navigationControl: true,

        geolocateControl: false,

        terrainControl: false,

        scaleControl: true,

        fullscreenControl: false
    });


// =========================
// MAP EVENTS
// =========================

map.on("load", async () => {
    mapStatus.textContent =
        "Loading country data...";

    await loadCountryData();

    addCountryLayers();

    mapStatus.textContent =
        "Select a country";

    restoreURLState();
});


map.on("error", event => {
    console.error(
        "Map error:",
        event.error
    );

    mapStatus.textContent =
        "The map could not be loaded.";
});

// =========================
// COUNTRY MAP LAYERS
// =========================

const COUNTRY_SOURCE_ID =
    "countryBoundaries";

const COUNTRY_FILL_LAYER =
    "countryFill";

const REGION_FILL_LAYER =
    "regionFill";

const REGION_HOVER_LAYER =
    "regionHover";

const REGION_BORDER_LAYER =
    "regionBorder";

const REGION_SELECTED_LAYER =
    "regionSelected";

let hoveredRegionId = null;

const COUNTRY_HOVER_LAYER =
    "countryHover";

const COUNTRY_BORDER_LAYER =
    "countryBorder";

let hoveredCountryName = null;


function addCountryLayers() {
    map.addSource(
        COUNTRY_SOURCE_ID,
        {
            type: "vector",
            url:
                "https://api.maptiler.com/tiles/countries/tiles.json"
        }
    );

    const styleLayers =
        map.getStyle().layers || [];

    const firstSymbolLayer =
        styleLayers.find(
            layer => layer.type === "symbol"
        );

    const layerBefore =
        firstSymbolLayer
            ? firstSymbolLayer.id
            : undefined;



    // Invisible clickable country polygons
    map.addLayer(
        {
            id: COUNTRY_FILL_LAYER,

            type: "fill",

            source: COUNTRY_SOURCE_ID,

            "source-layer":
                "administrative",

            filter: [
                "==",
                ["get", "level"],
                0
            ],

            paint: {
                "fill-color":
                    "rgba(59, 130, 246, 0)",

                "fill-opacity": 0
            }
        },
        layerBefore
    );

    // Hovered-country fill
    map.addLayer(
        {
            id: COUNTRY_HOVER_LAYER,

            type: "fill",

            source: COUNTRY_SOURCE_ID,

            "source-layer":
                "administrative",

            filter: [
                "all",

                [
                    "==",
                    ["get", "level"],
                    0
                ],

                [
                    "==",
                    ["get", "gid"],
                    ""
                ]
            ],

            paint: {
                "fill-color":
                    "#3b82f6",

                "fill-opacity":
                    0.28
            }
        },
        layerBefore
    );

    // Subtle border over the hovered country
    map.addLayer(
        {
            id: COUNTRY_BORDER_LAYER,

            type: "line",

            source: COUNTRY_SOURCE_ID,

            "source-layer":
                "administrative",

            filter: [
                "all",

                [
                    "==",
                    ["get", "level"],
                    0
                ],

                [
                    "==",
                    ["get", "gid"],
                    ""
                ]
            ],

            paint: {
                "line-color":
                    "#93c5fd",

                "line-width": 2
            }
        },
        layerBefore
    );

    // Darkens every country except the selected one
map.addLayer(
    {
        id: "countryDim",

        type: "fill",

        source: COUNTRY_SOURCE_ID,

        "source-layer":
            "administrative",

        filter: [
            "all",

            [
                "==",
                ["get", "level"],
                0
            ],

            [
                "==",
                ["get", "name"],
                "__NO_COUNTRY_SELECTED__"
            ]
        ],

        paint: {
            "fill-color": "#020617",
            "fill-opacity": 0.58
        }
    },
    layerBefore
);

// Strong selected-country outline
map.addLayer(
    {
        id: "countrySelected",

        type: "line",

        source: COUNTRY_SOURCE_ID,

        "source-layer":
            "administrative",

        filter: [
            "all",

            [
                "==",
                ["get", "level"],
                0
            ],

            [
                "==",
                ["get", "name"],
                "__NO_COUNTRY_SELECTED__"
            ]
        ],

        paint: {
            "line-color": "#60a5fa",
            "line-width": 4
        }
    },
    layerBefore
);

// =========================
// PROVINCE / STATE LAYERS
// =========================

// Transparent clickable regions
map.addLayer(
    {
        id: REGION_FILL_LAYER,

        type: "fill",

        source: COUNTRY_SOURCE_ID,

        "source-layer":
            "administrative",

        filter: [
            "all",

            [
                "==",
                ["get", "level"],
                1
            ],

            [
                "==",
                ["get", "level_0"],
                "__NO_COUNTRY_SELECTED__"
            ]
        ],

        paint: {
            "fill-color":
                "#60a5fa",

            "fill-opacity":
                0
        }
    },
    layerBefore
);


// Region hover colour
map.addLayer(
    {
        id: REGION_HOVER_LAYER,

        type: "fill",

        source: COUNTRY_SOURCE_ID,

        "source-layer":
            "administrative",

        filter: [
            "all",

            [
                "==",
                ["get", "level"],
                1
            ],

            [
                "==",
                ["get", "gid"],
                "__NO_REGION_HOVERED__"
            ]
        ],

        paint: {
            "fill-color":
                "#3b82f6",

            "fill-opacity":
                0.38
        }
    },
    layerBefore
);


// Visible borders between regions
map.addLayer(
    {
        id: REGION_BORDER_LAYER,

        type: "line",

        source: COUNTRY_SOURCE_ID,

        "source-layer":
            "administrative",

        filter: [
            "all",

            [
                "==",
                ["get", "level"],
                1
            ],

            [
                "==",
                ["get", "level_0"],
                "__NO_COUNTRY_SELECTED__"
            ]
        ],

        paint: {
            "line-color":
                "#cbd5e1",

            "line-width": 1.4,

            "line-opacity": 0.85
        }
    },
    layerBefore
);


// Strong outline for selected region
map.addLayer(
    {
        id: REGION_SELECTED_LAYER,

        type: "line",

        source: COUNTRY_SOURCE_ID,

        "source-layer":
            "administrative",

        filter: [
            "all",

            [
                "==",
                ["get", "level"],
                1
            ],

            [
                "==",
                ["get", "gid"],
                "__NO_REGION_SELECTED__"
            ]
        ],

        paint: {
            "line-color":
                "#f8fafc",

            "line-width": 4
        }
    },
    layerBefore
);

    addCountryEvents();
addRegionEvents();
}

function showCountryRegions(countryCode) {
    const normalizedCode =
        String(countryCode || "")
            .toUpperCase();

    if (!normalizedCode) {
        hideCountryRegions();
        return;
    }

    const countryRegionFilter = [
        "all",
        [
            "==",
            ["get", "level"],
            1
        ],
        [
            "==",
            ["get", "level_0"],
            normalizedCode
        ]
    ];

    map.setFilter(
        REGION_FILL_LAYER,
        countryRegionFilter
    );

    map.setFilter(
        REGION_BORDER_LAYER,
        countryRegionFilter
    );
}


function hideCountryRegions() {
    const emptyCountryFilter = [
        "all",
        [
            "==",
            ["get", "level"],
            1
        ],
        [
            "==",
            ["get", "level_0"],
            "__NO_COUNTRY_SELECTED__"
        ]
    ];

    const emptyRegionFilter = [
        "all",
        [
            "==",
            ["get", "level"],
            1
        ],
        [
            "==",
            ["get", "gid"],
            "__NO_REGION_SELECTED__"
        ]
    ];

    map.setFilter(
        REGION_FILL_LAYER,
        emptyCountryFilter
    );

    map.setFilter(
        REGION_BORDER_LAYER,
        emptyCountryFilter
    );

    map.setFilter(
        REGION_HOVER_LAYER,
        emptyRegionFilter
    );

    map.setFilter(
        REGION_SELECTED_LAYER,
        emptyRegionFilter
    );

    hoveredRegionId = null;
}

function addCountryEvents() {

    map.on(
    "mousemove",
    COUNTRY_FILL_LAYER,
    event => {
        const feature =
            event.features?.[0];

        if (!feature) {
            return;
        }

        const countryName =
            feature.properties.name;

        if (!countryName) {
            return;
        }

        if (
            hoveredCountryName ===
            countryName
        ) {
            return;
        }

        hoveredCountryName =
            countryName;

        const countryFilter = [
            "all",

            [
                "==",
                ["get", "level"],
                0
            ],

            [
                "==",
                ["get", "name"],
                countryName
            ]
        ];

        map.setFilter(
            COUNTRY_HOVER_LAYER,
            countryFilter
        );

        map.setFilter(
            COUNTRY_BORDER_LAYER,
            countryFilter
        );

        map.getCanvas().style.cursor =
            "pointer";

        mapStatus.textContent =
            countryName;
    }
);


    map.on(
    "click",
    COUNTRY_FILL_LAYER,
    async event => {
        const clickedRegions =
    map.queryRenderedFeatures(
        event.point,
        {
            layers: [
                REGION_FILL_LAYER
            ]
        }
    );

if (
    selectedCountry &&
    clickedRegions.length > 0
) {
    return;
}

        const feature =
            event.features?.[0];

        if (!feature) {
            return;
        }

        const properties =
            feature.properties;

        const details =
            findCountryData(
                properties
            );

        selectedCountry = {
            id:
                properties.gid ||
                properties.id ||
                properties.name,

            code:
                properties.iso_a2 ||
                properties.iso2 ||
                details?.iso2 ||
                "",

            name:
                properties.name ||
                details?.name ||
                "Unknown country",

            continent:
                details?.continent ||
                properties.continent ||
                "",

            data:
                details
        };

        selectedRegion = null;

        backButton.hidden = false;

        countryBreadcrumb.hidden =
            false;

        regionBreadcrumb.hidden =
            true;

        document.getElementById(
            "countryBreadcrumbButton"
        ).textContent =
            selectedCountry.name;

        mapStatus.textContent =
            selectedCountry.name;

        highlightSelectedCountry(
            selectedCountry.name
        );
        showCountryRegions(
    selectedCountry.code
);
map.setFilter(
    REGION_SELECTED_LAYER,
    [
        "all",
        [
            "==",
            ["get", "level"],
            1
        ],
        [
            "==",
            ["get", "gid"],
            "__NO_REGION_SELECTED__"
        ]
    ]
);


      

        openCountrySidebar(
            selectedCountry,
            details
        );

        updateURL();

        await zoomToCountry(
            selectedCountry
        );
    }
);
}

function addRegionEvents() {
    map.on(
        "mousemove",
        REGION_FILL_LAYER,
        event => {
            if (!selectedCountry) {
                return;
            }

            const feature =
                event.features?.[0];

            if (!feature) {
                return;
            }

            const properties =
                feature.properties || {};

            const regionId =
                properties.gid ||
                properties.code ||
                properties.name;

            if (!regionId) {
                return;
            }

            if (hoveredRegionId === regionId) {
                return;
            }

            hoveredRegionId = regionId;

            const hoverFilter =
                properties.gid
                    ? [
                        "all",
                        [
                            "==",
                            ["get", "level"],
                            1
                        ],
                        [
                            "==",
                            ["get", "gid"],
                            properties.gid
                        ]
                    ]
                    : [
                        "all",
                        [
                            "==",
                            ["get", "level"],
                            1
                        ],
                        [
                            "==",
                            ["get", "name"],
                            properties.name
                        ]
                    ];

            map.setFilter(
                REGION_HOVER_LAYER,
                hoverFilter
            );

            map.getCanvas().style.cursor =
                "pointer";

            mapStatus.textContent =
                properties.name ||
                "Unknown region";
        }
    );


    map.on(
        "mouseleave",
        REGION_FILL_LAYER,
        () => {
            hoveredRegionId = null;

            map.setFilter(
                REGION_HOVER_LAYER,
                [
                    "all",
                    [
                        "==",
                        ["get", "level"],
                        1
                    ],
                    [
                        "==",
                        ["get", "gid"],
                        "__NO_REGION_HOVERED__"
                    ]
                ]
            );

            map.getCanvas().style.cursor =
                "";

            mapStatus.textContent =
                selectedRegion?.name ||
                selectedCountry?.name ||
                "Select a country";
        }
    );


    map.on(
        "click",
        REGION_FILL_LAYER,
        event => {
            if (!selectedCountry) {
                return;
            }

            const feature =
                event.features?.[0];

            if (!feature) {
                return;
            }

            const properties =
                feature.properties || {};

            selectedRegion = {
    id:
        properties.gid ||
        properties.code ||
        properties.name,

    gid:
        properties.gid || "",

    code:
        properties.code || "",

    name:
        properties.name ||
        "Unknown region",

    countryCode:
        properties.level_0 ||
        selectedCountry.code,

    type:
        properties.type ||
        properties.class ||
        properties.admin_type ||
        properties.kind ||
        "Region",

    area:
        properties.area || null,

    wikidata:
        properties.wikidata || "",

    feature
};

            const selectedFilter =
                selectedRegion.gid
                    ? [
                        "all",
                        [
                            "==",
                            ["get", "level"],
                            1
                        ],
                        [
                            "==",
                            ["get", "gid"],
                            selectedRegion.gid
                        ]
                    ]
                    : [
                        "all",
                        [
                            "==",
                            ["get", "level"],
                            1
                        ],
                        [
                            "==",
                            ["get", "name"],
                            selectedRegion.name
                        ]
                    ];

            map.setFilter(
                REGION_SELECTED_LAYER,
                selectedFilter
            );

            regionBreadcrumb.hidden =
                false;

            document.getElementById(
                "regionBreadcrumbText"
            ).textContent =
                selectedRegion.name;

            mapStatus.textContent =
                selectedRegion.name;

            backButton.hidden =
                false;

            openTemporaryRegionSidebar(
    selectedRegion
);

zoomToRegion(
    selectedRegion
);

updateURL();

console.log(
    "Selected region:",
    selectedRegion
);
        }
    );
}

// =========================
// SIDEBAR
// =========================

function openSidebar() {
    mapSidebar.classList.add(
        "open"
    );

    mapSidebar.setAttribute(
        "aria-hidden",
        "false"
    );
}


function closeSidebar() {
    mapSidebar.classList.remove(
        "open"
    );

    mapSidebar.setAttribute(
        "aria-hidden",
        "true"
    );
}


closeSidebarButton.addEventListener(
    "click",
    closeSidebar
);


// =========================
// WORLD VIEW
// =========================

function returnToWorld() {
    selectedCountry = null;
    selectedRegion = null;
    
    clearSelectedCountryHighlight();
    hideCountryRegions();

    map.flyTo({
        center: WORLD_CENTER,
        zoom: WORLD_ZOOM,
        bearing: 0,
        pitch: 0,
        duration: 1200
    });

    backButton.hidden = true;

    countryBreadcrumb.hidden =
        true;

    regionBreadcrumb.hidden =
        true;

    mapStatus.textContent =
        "Select a country";

    closeSidebar();

    updateURL();
}


// =========================
// BACK NAVIGATION
// =========================

function goBackOneLevel() {
    if (selectedRegion) {
    selectedRegion = null;

    regionBreadcrumb.hidden =
        true;

    map.setFilter(
        REGION_SELECTED_LAYER,
        [
            "all",
            [
                "==",
                ["get", "level"],
                1
            ],
            [
                "==",
                ["get", "gid"],
                "__NO_REGION_SELECTED__"
            ]
        ]
    );

    mapStatus.textContent =
        selectedCountry
            ? selectedCountry.name
            : "Select a country";

    if (selectedCountry) {
        openCountrySidebar(
            selectedCountry,
            selectedCountry.data
        );

        zoomToCountry(
            selectedCountry
        );
    }

    updateURL();

    return;
}

    if (selectedCountry) {
        returnToWorld();
    }
}


backButton.addEventListener(
    "click",
    goBackOneLevel
);


// World breadcrumb

document
    .querySelector(
        '[data-level="world"]'
    )
    .addEventListener(
        "click",
        returnToWorld
    );


// =========================
// ESCAPE KEY
// =========================

document.addEventListener(
    "keydown",
    event => {
        if (event.key !== "Escape") {
            return;
        }

        if (
            !searchResults.hidden ||
            mapSearch.value.trim() !== ""
        ) {
            clearSearch();
            mapSearch.blur();
            return;
        }

        if (
            selectedCountry ||
            selectedRegion
        ) {
            goBackOneLevel();
            return;
        }

        closeSidebar();
    }
);


// =========================
// SEARCH SHELL
// =========================

mapSearch.addEventListener(
    "input",
    () => {
        const query =
            mapSearch.value
                .trim();

        clearSearchButton.hidden =
            query.length === 0;

        if (query.length < 2) {
            searchResults.hidden =
                true;

            searchResults.innerHTML =
                "";

            return;
        }

        /*
         * Country and province search
         * results will be added after
         * countries.json and
         * subdivisions.json are loaded.
         */

        searchResults.innerHTML = `
            <div class="search-placeholder">
                Search will become active
                when the map data is connected.
            </div>
        `;

        searchResults.hidden =
            false;
    }
);


function clearSearch() {
    mapSearch.value = "";

    clearSearchButton.hidden =
        true;

    searchResults.hidden =
        true;

    searchResults.innerHTML =
        "";
}


clearSearchButton.addEventListener(
    "click",
    () => {
        clearSearch();
        mapSearch.focus();
    }
);


// Close results when clicking elsewhere

document.addEventListener(
    "click",
    event => {
        const searchPanel =
            document.querySelector(
                ".search-panel"
            );

        if (
            !searchPanel.contains(
                event.target
            )
        ) {
            searchResults.hidden =
                true;
        }
    }
);


// =========================
// URL STATE
// =========================

function updateURL() {
    const url =
        new URL(
            window.location.href
        );

    url.searchParams.delete(
        "country"
    );

    url.searchParams.delete(
        "region"
    );

    if (selectedCountry) {
        url.searchParams.set(
            "country",
            selectedCountry.code ||
            selectedCountry.name
        );
    }

    if (selectedRegion) {
        url.searchParams.set(
            "region",
            selectedRegion.id ||
            selectedRegion.name
        );
    }

    window.history.replaceState(
        {},
        "",
        url
    );
}


function restoreURLState() {
    const parameters =
        new URLSearchParams(
            window.location.search
        );

    const country =
        parameters.get(
            "country"
        );

    const region =
        parameters.get(
            "region"
        );

    if (!country) {
        return;
    }

    /*
     * Once countries.json is connected,
     * this will find the matching country
     * and automatically open it.
     */

    console.log(
        "Requested country:",
        country
    );

    if (region) {
        console.log(
            "Requested region:",
            region
        );
    }
}

function findCountryData(
    mapProperties
) {
    const mapCode =
        (
            mapProperties.iso_a2 ||
            mapProperties.iso2 ||
            mapProperties.country_code ||
            ""
        )
            .toUpperCase();

    const mapName =
        (
            mapProperties.name ||
            ""
        )
            .trim()
            .toLowerCase();

    return (
        countryData.find(country =>
            String(country.iso2 || "")
                .toUpperCase() ===
            mapCode
        ) ||

        countryData.find(country =>
            String(country.name || "")
                .trim()
                .toLowerCase() ===
            mapName
        ) ||

        null
    );
}

function formatPopulation(value) {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "Not added yet";
    }

    const number =
        Number(value);

    if (!Number.isFinite(number)) {
        return String(value);
    }

    return number.toLocaleString();
}

function highlightSelectedCountry(countryName) {
    map.setFilter(
        "countryDim",
        [
            "all",
            ["==", ["get", "level"], 0],
            ["!=", ["get", "name"], countryName]
        ]
    );

    map.setFilter(
        "countrySelected",
        [
            "all",
            ["==", ["get", "level"], 0],
            ["==", ["get", "name"], countryName]
        ]
    );
}


function clearSelectedCountryHighlight() {
    const emptyFilter = [
        "all",
        ["==", ["get", "level"], 0],
        [
            "==",
            ["get", "name"],
            "__NO_COUNTRY_SELECTED__"
        ]
    ];

    map.setFilter(
        "countryDim",
        emptyFilter
    );

    map.setFilter(
        "countrySelected",
        emptyFilter
    );
}

async function zoomToCountry(country) {
    try {
        /*
         * Search using the full country name,
         * not the two-letter ISO code.
         */
        const searchValue =
            country.data?.name ||
            country.name;

        const requestURL =
            "https://api.maptiler.com/geocoding/" +
            encodeURIComponent(searchValue) +
            ".json" +
            "?types=country" +
            "&limit=10" +
            "&language=en" +
            "&key=" +
            encodeURIComponent(MAPTILER_KEY);

        const response =
            await fetch(requestURL);

        if (!response.ok) {
            throw new Error(
                "Country lookup failed with status " +
                response.status
            );
        }

        const result =
            await response.json();

        const expectedCode =
            String(
                country.code ||
                country.data?.iso2 ||
                ""
            ).toUpperCase();

        const expectedName =
            String(searchValue)
                .trim()
                .toLowerCase();

        /*
         * Prefer an exact ISO-code match.
         */
        let feature =
            result.features?.find(item => {
                const resultCode =
                    String(
                        item.properties?.country_code ||
                        item.country_code ||
                        ""
                    ).toUpperCase();

                return (
                    expectedCode &&
                    resultCode === expectedCode
                );
            });

        /*
         * Otherwise use an exact country-name match.
         */
        if (!feature) {
            feature =
                result.features?.find(item => {
                    const names = [
                        item.text,
                        item.place_name,
                        item.properties?.name
                    ]
                        .filter(Boolean)
                        .map(value =>
                            String(value)
                                .trim()
                                .toLowerCase()
                        );

                    return names.some(name =>
                        name === expectedName ||
                        name.startsWith(
                            expectedName + ","
                        )
                    );
                });
        }

        /*
         * Last fallback: first country result.
         */
        if (!feature) {
            feature =
                result.features?.[0];
        }

        if (!feature) {
            throw new Error(
                "No matching country result was returned."
            );
        }

        console.log(
            "Country zoom result:",
            feature
        );

        if (
            Array.isArray(feature.bbox) &&
            feature.bbox.length === 4
        ) {
            const [
                west,
                south,
                east,
                north
            ] = feature.bbox;

            const desktop =
                window.innerWidth > 900;

            map.fitBounds(
                [
                    [west, south],
                    [east, north]
                ],
                {
                    padding: desktop
                        ? {
                            top: 70,
                            bottom: 70,
                            left: 70,
                            right: 450
                        }
                        : {
                            top: 70,
                            bottom: 330,
                            left: 45,
                            right: 45
                        },

                    duration: 1200,
                    maxZoom: 7
                }
            );

            return;
        }

        if (
            Array.isArray(feature.center) &&
            feature.center.length === 2
        ) {
            map.flyTo({
                center: feature.center,
                zoom: 5,
                duration: 1200
            });

            return;
        }

        throw new Error(
            "The matched country had no usable bounds or center."
        );
    }
    catch (error) {
        console.error(
            "Country zoom error:",
            error
        );

        mapStatus.textContent =
            "Selected " +
            country.name +
            ", but zooming failed.";
    }
}

function getGeometryCoordinates(geometry) {
    if (!geometry) {
        return [];
    }

    if (geometry.type === "Polygon") {
        return geometry.coordinates.flat();
    }

    if (geometry.type === "MultiPolygon") {
        return geometry.coordinates.flat(2);
    }

    return [];
}


function zoomToRegion(region) {
    const geometry =
        region.feature?.geometry;

    const coordinates =
        getGeometryCoordinates(
            geometry
        );

    if (!coordinates.length) {
        console.warn(
            "No usable region geometry:",
            region
        );

        return;
    }

    let west = Infinity;
    let south = Infinity;
    let east = -Infinity;
    let north = -Infinity;

    coordinates.forEach(coordinate => {
        if (
            !Array.isArray(coordinate) ||
            coordinate.length < 2
        ) {
            return;
        }

        const longitude =
            Number(coordinate[0]);

        const latitude =
            Number(coordinate[1]);

        if (
            !Number.isFinite(longitude) ||
            !Number.isFinite(latitude)
        ) {
            return;
        }

        west =
            Math.min(west, longitude);

        south =
            Math.min(south, latitude);

        east =
            Math.max(east, longitude);

        north =
            Math.max(north, latitude);
    });

    if (
        !Number.isFinite(west) ||
        !Number.isFinite(south) ||
        !Number.isFinite(east) ||
        !Number.isFinite(north)
    ) {
        return;
    }

    const desktop =
        window.innerWidth > 900;

    map.fitBounds(
        [
            [west, south],
            [east, north]
        ],
        {
            padding: desktop
                ? {
                    top: 75,
                    bottom: 75,
                    left: 75,
                    right: 450
                }
                : {
                    top: 60,
                    bottom: 330,
                    left: 40,
                    right: 40
                },

            duration: 1100,
            maxZoom: 10
        }
    );
}

// =========================
// MAP THEME
// =========================


function openCountrySidebar(
    mapCountry,
    details
) {
    document.getElementById(
        "sidebarEmpty"
    ).hidden = true;

    document.getElementById(
        "sidebarLoading"
    ).hidden = true;

    document.getElementById(
        "regionSidebar"
    ).hidden = true;

    document.getElementById(
        "countrySidebar"
    ).hidden = false;

    document.getElementById(
        "countryName"
    ).textContent =
        details?.name ||
        mapCountry.name ||
        "Unknown country";

    document.getElementById(
        "countryContinent"
    ).textContent =
        details?.continent ||
        mapCountry.continent ||
        "Continent unavailable";

    document.getElementById(
        "countryCapital"
    ).textContent =
        details?.capital ||
        "Not added yet";

    document.getElementById(
        "countryLanguages"
    ).textContent =
        Array.isArray(details?.languages)
            ? details.languages.join(", ")
            : (
                details?.languages ||
                "Not added yet"
            );

    document.getElementById(
        "countryPopulation"
    ).textContent =
        formatPopulation(
            details?.population
        );

    document.getElementById(
        "countryPhoneCode"
    ).textContent =
        details?.phoneCode ||
        "Not added yet";

    document.getElementById(
        "countryFact"
    ).textContent =
        details?.fact ||
        "Detailed country information has not been added yet.";

    const flag =
        document.getElementById(
            "countryFlag"
        );

    if (details?.flag) {
        flag.src =
            details.flag;

        flag.alt =
            (
                details.name ||
                mapCountry.name
            ) +
            " flag";

        flag.hidden = false;

        flag.onerror = () => {
            flag.hidden = true;
        };
    }
    else {
        flag.hidden = true;
    }

    const subdivisionMessage =
        document.getElementById(
            "countrySubdivisionMessage"
        );

    subdivisionMessage.textContent =
        details
            ? "Select a province or state on the map to explore it further."
            : "Country information has not been added to countries.json yet.";

    openSidebar();
}

function formatRegionType(type) {
    const value =
        String(type || "Region")
            .trim()
            .toUpperCase();

    const typeNames = {
        STATE: "STATE",
        PROVINCE: "PROVINCE",
        REGION: "REGION",
        COUNTY: "COUNTY",
        CANTON: "CANTON",
        PREFECTURE: "PREFECTURE",
        EMIRATE: "EMIRATE",
        TERRITORY: "TERRITORY",
        DISTRICT: "DISTRICT",
        DEPARTMENT: "DEPARTMENT",
        GOVERNORATE: "GOVERNORATE",
        MUNICIPALITY: "MUNICIPALITY",
        AUTONOMOUS_REGION: "AUTONOMOUS REGION"
    };

    return typeNames[value] || value;
}


function openTemporaryRegionSidebar(region) {
    document.getElementById(
        "sidebarEmpty"
    ).hidden = true;

    document.getElementById(
        "sidebarLoading"
    ).hidden = true;

    document.getElementById(
        "countrySidebar"
    ).hidden = true;

    document.getElementById(
        "regionSidebar"
    ).hidden = false;

    document.getElementById(
    "regionType"
).textContent =
    formatRegionType(
        region.type
    );

    document.getElementById(
        "regionName"
    ).textContent =
        region.name;

    document.getElementById(
        "regionCountry"
    ).textContent =
        selectedCountry?.name ||
        region.countryCode ||
        "Unknown country";

    document.getElementById(
        "regionCapital"
    ).textContent =
        "Not connected yet";

    document.getElementById(
        "regionMajorCity"
    ).textContent =
        "Not connected yet";

    document.getElementById(
        "regionCountryPhone"
    ).textContent =
        selectedCountry?.data?.phoneCode ||
        "Not connected yet";

    document.getElementById(
        "regionAreaCodeCard"
    ).hidden = true;

    document.getElementById(
        "regionFact"
    ).textContent =
        region.area
            ? "Map area: " +
                Number(region.area)
                    .toLocaleString() +
                " km²"
            : "Regional information is not connected yet.";

    document.getElementById(
        "regionFlag"
    ).hidden = true;

    document.getElementById(
        "regionFlagFallback"
    ).hidden = false;

    document.getElementById(
        "regionMissingFlag"
    ).hidden = false;

    openSidebar();
}