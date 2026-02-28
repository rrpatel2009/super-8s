/**
 * 2025 NCAA Tournament data for demo/test mode.
 *
 * Teams are the actual 2025 bracket with real seeds and results.
 * Wins accumulate per round. The "roundSnapshots" array drives the
 * time-slider: index 0 = just after Selection Sunday (0 wins),
 * index 1 = after First Four / Round of 64, etc.
 *
 * Scoring: seed × wins  (same as Super 8s rules)
 */

export interface DemoTeam {
  id: string
  name: string
  shortName: string
  seed: number
  region: "East" | "West" | "South" | "Midwest"
  logoUrl: string | null
  isPlayIn: boolean
  // Wins at each round checkpoint [Selection, R64, R32, S16, E8, F4, NCG, Champion]
  winsAtRound: number[]
  // Whether eliminated at each checkpoint
  elimAtRound: boolean[]
}

export interface DemoUser {
  id: string
  name: string
  email: string
  isPaid: boolean
  charityPreference: string | null
  role?: "USER" | "ADMIN" | "SUPERADMIN"
  // 8 team IDs this user picked
  picks: string[]
}

export const ROUND_LABELS = [
  "Selection Sunday",
  "First Four / R64",
  "Round of 32",
  "Sweet Sixteen",
  "Elite Eight",
  "Final Four",
  "Championship",
  "Champion Crowned",
]

// ─── 2025 Teams ────────────────────────────────────────────────────────────────
// winsAtRound[i] = number of tournament wins as of checkpoint i
// elimAtRound[i] = true if the team is eliminated at/before checkpoint i

export const DEMO_TEAMS: DemoTeam[] = [
  // ── EAST REGION ──────────────────────────────────────────────────────────────
  { id: "duke", name: "Duke", shortName: "DUKE", seed: 1, region: "East", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/150.png", isPlayIn: false,
    winsAtRound: [0,1,2,3,4,5,6,6], elimAtRound: [false,false,false,false,false,false,false,false] }, // 2025 Champion
  { id: "alabama", name: "Alabama", shortName: "ALA", seed: 2, region: "East", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/333.png", isPlayIn: false,
    winsAtRound: [0,1,2,3,4,4,4,4], elimAtRound: [false,false,false,false,false,true,true,true] }, // Lost F4
  { id: "iowa-st", name: "Iowa State", shortName: "ISU", seed: 3, region: "East", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/66.png", isPlayIn: false,
    winsAtRound: [0,1,2,3,3,3,3,3], elimAtRound: [false,false,false,false,true,true,true,true] }, // Lost E8
  { id: "maryland", name: "Maryland", shortName: "MD", seed: 4, region: "East", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/120.png", isPlayIn: false,
    winsAtRound: [0,1,2,2,2,2,2,2], elimAtRound: [false,false,false,true,true,true,true,true] },
  { id: "michigan-st", name: "Michigan State", shortName: "MSU", seed: 5, region: "East", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/127.png", isPlayIn: false,
    winsAtRound: [0,1,2,3,3,3,3,3], elimAtRound: [false,false,false,false,true,true,true,true] }, // Sweet 16 run
  { id: "ole-miss", name: "Ole Miss", shortName: "MISS", seed: 6, region: "East", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/145.png", isPlayIn: false,
    winsAtRound: [0,1,1,1,1,1,1,1], elimAtRound: [false,false,true,true,true,true,true,true] },
  { id: "new-mexico", name: "New Mexico", shortName: "UNM", seed: 7, region: "East", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/167.png", isPlayIn: false,
    winsAtRound: [0,0,0,0,0,0,0,0], elimAtRound: [false,true,true,true,true,true,true,true] },
  { id: "uc-san-diego", name: "UC San Diego", shortName: "UCSD", seed: 8, region: "East", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/2724.png", isPlayIn: false,
    winsAtRound: [0,1,1,1,1,1,1,1], elimAtRound: [false,false,true,true,true,true,true,true] },
  { id: "byu", name: "BYU", shortName: "BYU", seed: 9, region: "East", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/252.png", isPlayIn: false,
    winsAtRound: [0,0,0,0,0,0,0,0], elimAtRound: [false,true,true,true,true,true,true,true] },
  { id: "vanderbilt", name: "Vanderbilt", shortName: "VAN", seed: 10, region: "East", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/238.png", isPlayIn: false,
    winsAtRound: [0,1,2,2,2,2,2,2], elimAtRound: [false,false,false,true,true,true,true,true] },
  { id: "vt", name: "Virginia Tech", shortName: "VT", seed: 11, region: "East", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/259.png", isPlayIn: false,
    winsAtRound: [0,0,0,0,0,0,0,0], elimAtRound: [false,true,true,true,true,true,true,true] },
  { id: "liberty", name: "Liberty", shortName: "LIB", seed: 12, region: "East", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/2335.png", isPlayIn: false,
    winsAtRound: [0,0,0,0,0,0,0,0], elimAtRound: [false,true,true,true,true,true,true,true] },
  { id: "yale", name: "Yale", shortName: "YALE", seed: 13, region: "East", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/43.png", isPlayIn: false,
    winsAtRound: [0,0,0,0,0,0,0,0], elimAtRound: [false,true,true,true,true,true,true,true] },
  { id: "lipscomb", name: "Lipscomb", shortName: "LIP", seed: 14, region: "East", logoUrl: null, isPlayIn: false,
    winsAtRound: [0,0,0,0,0,0,0,0], elimAtRound: [false,true,true,true,true,true,true,true] },
  { id: "montana", name: "Montana", shortName: "MONT", seed: 15, region: "East", logoUrl: null, isPlayIn: false,
    winsAtRound: [0,0,0,0,0,0,0,0], elimAtRound: [false,true,true,true,true,true,true,true] },
  { id: "amer-univ", name: "American Univ.", shortName: "AMER", seed: 16, region: "East", logoUrl: null, isPlayIn: false,
    winsAtRound: [0,0,0,0,0,0,0,0], elimAtRound: [false,true,true,true,true,true,true,true] },

  // ── WEST REGION ──────────────────────────────────────────────────────────────
  { id: "florida", name: "Florida", shortName: "FLA", seed: 1, region: "West", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/57.png", isPlayIn: false,
    winsAtRound: [0,1,2,3,4,5,5,5], elimAtRound: [false,false,false,false,false,false,true,true] }, // Lost championship
  { id: "st-johns", name: "St. John's", shortName: "SJU", seed: 2, region: "West", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/2599.png", isPlayIn: false,
    winsAtRound: [0,1,2,3,4,4,4,4], elimAtRound: [false,false,false,false,false,true,true,true] }, // Lost F4
  { id: "texas-tech", name: "Texas Tech", shortName: "TTU", seed: 3, region: "West", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/2641.png", isPlayIn: false,
    winsAtRound: [0,1,2,3,3,3,3,3], elimAtRound: [false,false,false,false,true,true,true,true] },
  { id: "maryland-2", name: "Maryland", shortName: "MD", seed: 4, region: "West", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/120.png", isPlayIn: false,
    winsAtRound: [0,1,1,1,1,1,1,1], elimAtRound: [false,false,true,true,true,true,true,true] },
  { id: "memphis", name: "Memphis", shortName: "MEM", seed: 5, region: "West", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/235.png", isPlayIn: false,
    winsAtRound: [0,0,0,0,0,0,0,0], elimAtRound: [false,true,true,true,true,true,true,true] },
  { id: "missouri", name: "Missouri", shortName: "MIZ", seed: 6, region: "West", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/142.png", isPlayIn: false,
    winsAtRound: [0,1,2,3,3,3,3,3], elimAtRound: [false,false,false,false,true,true,true,true] },
  { id: "kansas", name: "Kansas", shortName: "KU", seed: 7, region: "West", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/2305.png", isPlayIn: false,
    winsAtRound: [0,1,2,2,2,2,2,2], elimAtRound: [false,false,false,true,true,true,true,true] },
  { id: "ucf", name: "UCF", shortName: "UCF", seed: 8, region: "West", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/2116.png", isPlayIn: false,
    winsAtRound: [0,1,1,1,1,1,1,1], elimAtRound: [false,false,true,true,true,true,true,true] },
  { id: "kentucky", name: "Kentucky", shortName: "UK", seed: 9, region: "West", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/96.png", isPlayIn: false,
    winsAtRound: [0,0,0,0,0,0,0,0], elimAtRound: [false,true,true,true,true,true,true,true] },
  { id: "arkansas", name: "Arkansas", shortName: "ARK", seed: 10, region: "West", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/8.png", isPlayIn: false,
    winsAtRound: [0,1,1,1,1,1,1,1], elimAtRound: [false,false,true,true,true,true,true,true] },
  { id: "vcu", name: "VCU", shortName: "VCU", seed: 11, region: "West", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/2670.png", isPlayIn: false,
    winsAtRound: [0,0,0,0,0,0,0,0], elimAtRound: [false,true,true,true,true,true,true,true] },
  { id: "colorado-st", name: "Colorado State", shortName: "CSU", seed: 12, region: "West", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/36.png", isPlayIn: false,
    winsAtRound: [0,1,1,1,1,1,1,1], elimAtRound: [false,false,true,true,true,true,true,true] },
  { id: "grand-canyon", name: "Grand Canyon", shortName: "GCU", seed: 13, region: "West", logoUrl: null, isPlayIn: false,
    winsAtRound: [0,0,0,0,0,0,0,0], elimAtRound: [false,true,true,true,true,true,true,true] },
  { id: "siu-edwardsville", name: "SIU Edwardsville", shortName: "SIUE", seed: 14, region: "West", logoUrl: null, isPlayIn: false,
    winsAtRound: [0,0,0,0,0,0,0,0], elimAtRound: [false,true,true,true,true,true,true,true] },
  { id: "alcorn", name: "Alcorn State", shortName: "ALCN", seed: 15, region: "West", logoUrl: null, isPlayIn: false,
    winsAtRound: [0,0,0,0,0,0,0,0], elimAtRound: [false,true,true,true,true,true,true,true] },
  { id: "norfolk-st", name: "Norfolk State", shortName: "NORF", seed: 16, region: "West", logoUrl: null, isPlayIn: false,
    winsAtRound: [0,0,0,0,0,0,0,0], elimAtRound: [false,true,true,true,true,true,true,true] },

  // ── SOUTH REGION ─────────────────────────────────────────────────────────────
  { id: "auburn", name: "Auburn", shortName: "AUB", seed: 1, region: "South", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/2.png", isPlayIn: false,
    winsAtRound: [0,1,2,3,4,4,4,4], elimAtRound: [false,false,false,false,false,true,true,true] }, // Lost F4
  { id: "michigan", name: "Michigan", shortName: "MICH", seed: 2, region: "South", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/130.png", isPlayIn: false,
    winsAtRound: [0,1,2,3,3,3,3,3], elimAtRound: [false,false,false,false,true,true,true,true] },
  { id: "iowa", name: "Iowa", shortName: "IOWA", seed: 3, region: "South", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/2294.png", isPlayIn: false,
    winsAtRound: [0,1,2,2,2,2,2,2], elimAtRound: [false,false,false,true,true,true,true,true] },
  { id: "texas-am", name: "Texas A&M", shortName: "TAMU", seed: 4, region: "South", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/245.png", isPlayIn: false,
    winsAtRound: [0,1,1,1,1,1,1,1], elimAtRound: [false,false,true,true,true,true,true,true] },
  { id: "oregon", name: "Oregon", shortName: "ORE", seed: 5, region: "South", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/2483.png", isPlayIn: false,
    winsAtRound: [0,1,2,3,3,3,3,3], elimAtRound: [false,false,false,false,true,true,true,true] },
  { id: "louisville", name: "Louisville", shortName: "LOU", seed: 6, region: "South", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/97.png", isPlayIn: false,
    winsAtRound: [0,1,2,2,2,2,2,2], elimAtRound: [false,false,false,true,true,true,true,true] },
  { id: "uconn", name: "UConn", shortName: "CONN", seed: 7, region: "South", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/41.png", isPlayIn: false,
    winsAtRound: [0,0,0,0,0,0,0,0], elimAtRound: [false,true,true,true,true,true,true,true] },
  { id: "gonzaga", name: "Gonzaga", shortName: "GONZ", seed: 8, region: "South", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/2250.png", isPlayIn: false,
    winsAtRound: [0,1,2,3,4,5,5,5], elimAtRound: [false,false,false,false,false,false,true,true] }, // Cinderella! Lost championship
  { id: "baylor", name: "Baylor", shortName: "BAY", seed: 9, region: "South", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/239.png", isPlayIn: false,
    winsAtRound: [0,0,0,0,0,0,0,0], elimAtRound: [false,true,true,true,true,true,true,true] },
  { id: "utah-st", name: "Utah State", shortName: "USU", seed: 10, region: "South", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/328.png", isPlayIn: false,
    winsAtRound: [0,1,1,1,1,1,1,1], elimAtRound: [false,false,true,true,true,true,true,true] },
  { id: "drake", name: "Drake", shortName: "DRK", seed: 11, region: "South", logoUrl: null, isPlayIn: false,
    winsAtRound: [0,1,1,1,1,1,1,1], elimAtRound: [false,false,true,true,true,true,true,true] },
  { id: "uc-irvine", name: "UC Irvine", shortName: "UCI", seed: 12, region: "South", logoUrl: null, isPlayIn: false,
    winsAtRound: [0,1,2,2,2,2,2,2], elimAtRound: [false,false,false,true,true,true,true,true] },
  { id: "high-point", name: "High Point", shortName: "HPU", seed: 13, region: "South", logoUrl: null, isPlayIn: false,
    winsAtRound: [0,0,0,0,0,0,0,0], elimAtRound: [false,true,true,true,true,true,true,true] },
  { id: "troy", name: "Troy", shortName: "TROY", seed: 14, region: "South", logoUrl: null, isPlayIn: false,
    winsAtRound: [0,0,0,0,0,0,0,0], elimAtRound: [false,true,true,true,true,true,true,true] },
  { id: "wofford", name: "Wofford", shortName: "WOF", seed: 15, region: "South", logoUrl: null, isPlayIn: false,
    winsAtRound: [0,0,0,0,0,0,0,0], elimAtRound: [false,true,true,true,true,true,true,true] },
  { id: "southern-univ", name: "Southern Univ.", shortName: "SOU", seed: 16, region: "South", logoUrl: null, isPlayIn: false,
    winsAtRound: [0,0,0,0,0,0,0,0], elimAtRound: [false,true,true,true,true,true,true,true] },

  // ── MIDWEST REGION ───────────────────────────────────────────────────────────
  { id: "houston", name: "Houston", shortName: "HOU", seed: 1, region: "Midwest", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/248.png", isPlayIn: false,
    winsAtRound: [0,1,2,3,4,4,4,4], elimAtRound: [false,false,false,false,false,true,true,true] }, // Lost F4
  { id: "tennessee", name: "Tennessee", shortName: "TENN", seed: 2, region: "Midwest", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/2633.png", isPlayIn: false,
    winsAtRound: [0,1,2,3,4,5,5,5], elimAtRound: [false,false,false,false,false,false,true,true] }, // Final Four run
  { id: "kentucky-2", name: "Kentucky", shortName: "UK", seed: 3, region: "Midwest", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/96.png", isPlayIn: false,
    winsAtRound: [0,1,2,3,3,3,3,3], elimAtRound: [false,false,false,false,true,true,true,true] },
  { id: "purdue", name: "Purdue", shortName: "PUR", seed: 4, region: "Midwest", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/2509.png", isPlayIn: false,
    winsAtRound: [0,1,2,2,2,2,2,2], elimAtRound: [false,false,false,true,true,true,true,true] },
  { id: "clemson", name: "Clemson", shortName: "CLEM", seed: 5, region: "Midwest", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/228.png", isPlayIn: false,
    winsAtRound: [0,0,0,0,0,0,0,0], elimAtRound: [false,true,true,true,true,true,true,true] },
  { id: "illinois", name: "Illinois", shortName: "ILL", seed: 6, region: "Midwest", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/356.png", isPlayIn: false,
    winsAtRound: [0,1,1,1,1,1,1,1], elimAtRound: [false,false,true,true,true,true,true,true] },
  { id: "ucla", name: "UCLA", shortName: "UCLA", seed: 7, region: "Midwest", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/26.png", isPlayIn: false,
    winsAtRound: [0,1,2,3,3,3,3,3], elimAtRound: [false,false,false,false,true,true,true,true] },
  { id: "oklahoma", name: "Oklahoma", shortName: "OU", seed: 8, region: "Midwest", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/201.png", isPlayIn: false,
    winsAtRound: [0,1,2,2,2,2,2,2], elimAtRound: [false,false,false,true,true,true,true,true] },
  { id: "georgia", name: "Georgia", shortName: "UGA", seed: 9, region: "Midwest", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/61.png", isPlayIn: false,
    winsAtRound: [0,0,0,0,0,0,0,0], elimAtRound: [false,true,true,true,true,true,true,true] },
  { id: "north-carolina", name: "North Carolina", shortName: "UNC", seed: 10, region: "Midwest", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/153.png", isPlayIn: false,
    winsAtRound: [0,0,0,0,0,0,0,0], elimAtRound: [false,true,true,true,true,true,true,true] },
  { id: "wake-forest", name: "Wake Forest", shortName: "WAKE", seed: 11, region: "Midwest", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/154.png", isPlayIn: false,
    winsAtRound: [0,1,1,1,1,1,1,1], elimAtRound: [false,false,true,true,true,true,true,true] },
  { id: "james-madison", name: "James Madison", shortName: "JMU", seed: 12, region: "Midwest", logoUrl: null, isPlayIn: false,
    winsAtRound: [0,0,0,0,0,0,0,0], elimAtRound: [false,true,true,true,true,true,true,true] },
  { id: "akron", name: "Akron", shortName: "AKR", seed: 13, region: "Midwest", logoUrl: null, isPlayIn: false,
    winsAtRound: [0,0,0,0,0,0,0,0], elimAtRound: [false,true,true,true,true,true,true,true] },
  { id: "se-louisiana", name: "SE Louisiana", shortName: "SELA", seed: 14, region: "Midwest", logoUrl: null, isPlayIn: false,
    winsAtRound: [0,0,0,0,0,0,0,0], elimAtRound: [false,true,true,true,true,true,true,true] },
  { id: "prairie-view", name: "Prairie View A&M", shortName: "PVAM", seed: 15, region: "Midwest", logoUrl: null, isPlayIn: false,
    winsAtRound: [0,0,0,0,0,0,0,0], elimAtRound: [false,true,true,true,true,true,true,true] },
  { id: "omaha", name: "Nebraska Omaha", shortName: "UNO", seed: 16, region: "Midwest", logoUrl: null, isPlayIn: false,
    winsAtRound: [0,0,0,0,0,0,0,0], elimAtRound: [false,true,true,true,true,true,true,true] },
]

// ─── 12 Demo Users with Picks ──────────────────────────────────────────────────
// Each user picks exactly 8 teams — mixing smart picks and chaotic ones.
// Some users have high-seed chalk, others go full cinderella mode.

export const DEMO_USERS: DemoUser[] = [
  {
    id: "user-chalk",
    name: "Alex Chalk",
    email: "alex@demo.test",
    isPaid: true,
    charityPreference: "St. Jude Children's Hospital",
    picks: ["duke", "florida", "tennessee", "auburn", "alabama", "gonzaga", "iowa-st", "michigan-st"],
  },
  {
    id: "user-cinderella",
    name: "Casey Upset",
    email: "casey@demo.test",
    isPaid: true,
    charityPreference: "Red Cross",
    picks: ["gonzaga", "uc-irvine", "vanderbilt", "missouri", "arkansas", "wake-forest", "uc-san-diego", "illinois"],
  },
  {
    id: "user-balanced",
    name: "Jordan Balance",
    email: "jordan@demo.test",
    isPaid: true,
    charityPreference: "Local Food Bank",
    picks: ["duke", "tennessee", "gonzaga", "iowa-st", "michigan-st", "oregon", "missouri", "uc-irvine"],
  },
  {
    id: "user-midwest",
    name: "Sam Midwesterner",
    email: "sam@demo.test",
    isPaid: false,
    charityPreference: null,
    picks: ["houston", "tennessee", "kentucky-2", "purdue", "iowa", "michigan", "auburn", "duke"],
  },
  {
    id: "user-high-seeds",
    name: "Riley Seed Chaser",
    email: "riley@demo.test",
    isPaid: true,
    charityPreference: "Habitat for Humanity",
    picks: ["gonzaga", "uc-irvine", "colorado-st", "vanderbilt", "arkansas", "michigan-st", "missouri", "ucla"],
  },
  {
    id: "user-no-luck",
    name: "Taylor Busted",
    email: "taylor@demo.test",
    isPaid: true,
    charityPreference: null,
    picks: ["kentucky", "uconn", "baylor", "clemson", "vcu", "vt", "new-mexico", "drake"],
  },
  {
    id: "user-florida-homer",
    name: "Morgan Gator",
    email: "morgan@demo.test",
    isPaid: true,
    charityPreference: "Boys & Girls Club",
    picks: ["florida", "tennessee", "auburn", "duke", "gonzaga", "alabama", "iowa-st", "oregon"],
  },
  {
    id: "user-contrarian",
    name: "Quinn Contrarian",
    email: "quinn@demo.test",
    isPaid: false,
    charityPreference: null,
    picks: ["gonzaga", "tennessee", "missouri", "michigan-st", "iowa-st", "vanderbilt", "uc-irvine", "ucla"],
  },
  {
    id: "user-analyst",
    name: "Dana Analytics",
    email: "dana@demo.test",
    isPaid: true,
    charityPreference: "STEM Education Fund",
    picks: ["duke", "florida", "tennessee", "auburn", "gonzaga", "michigan-st", "iowa-st", "alabama"],
  },
  {
    id: "user-random",
    name: "Pat Random",
    email: "pat@demo.test",
    isPaid: true,
    charityPreference: null,
    picks: ["alabama", "st-johns", "texas-tech", "michigan", "houston", "iowa", "vanderbilt", "gonzaga"],
  },
  {
    id: "user-newbie",
    name: "Drew Newbie",
    email: "drew@demo.test",
    isPaid: false,
    charityPreference: "Children's Hospital",
    picks: ["duke", "florida", "auburn", "houston", "alabama", "tennessee", "iowa-st", "michigan"],
  },
  {
    id: "user-you",
    name: "You (Demo)",
    email: "you@demo.test",
    isPaid: true,
    charityPreference: "UNICEF",
    picks: ["duke", "gonzaga", "tennessee", "iowa-st", "michigan-st", "missouri", "uc-irvine", "oregon"],
  },
]

// ─── Scoring helpers ───────────────────────────────────────────────────────────

export function getTeamAtRound(teamId: string, roundIdx: number): { wins: number; eliminated: boolean } | null {
  const team = DEMO_TEAMS.find((t) => t.id === teamId)
  if (!team) return null
  return {
    wins: team.winsAtRound[roundIdx] ?? 0,
    eliminated: team.elimAtRound[roundIdx] ?? true,
  }
}

export interface DemoLeaderboardEntry {
  rank: number
  userId: string
  name: string
  email: string
  isPaid: boolean
  charityPreference: string | null
  currentScore: number
  ppr: number
  tps: number
  teamsRemaining: number
  picks: Array<{
    teamId: string
    name: string
    shortName: string
    seed: number
    region: string
    wins: number
    eliminated: boolean
    logoUrl: string | null
    score: number
    ppr: number
  }>
}

export function computeDemoLeaderboard(roundIdx: number): DemoLeaderboardEntry[] {
  const teamMap = new Map(DEMO_TEAMS.map((t) => [t.id, t]))

  const entries = DEMO_USERS.map((user) => {
    let currentScore = 0
    let ppr = 0
    let teamsRemaining = 0

    const picks = user.picks.map((teamId) => {
      const team = teamMap.get(teamId)
      if (!team) return null
      const state = getTeamAtRound(teamId, roundIdx)!
      const score = team.seed * state.wins
      const teamPPR = state.eliminated ? 0 : team.seed * Math.max(0, 6 - state.wins)

      currentScore += score
      ppr += teamPPR
      if (!state.eliminated) teamsRemaining++

      return {
        teamId,
        name: team.name,
        shortName: team.shortName,
        seed: team.seed,
        region: team.region,
        wins: state.wins,
        eliminated: state.eliminated,
        logoUrl: team.logoUrl,
        score,
        ppr: teamPPR,
      }
    }).filter(Boolean) as DemoLeaderboardEntry["picks"]

    return {
      userId: user.id,
      name: user.name,
      email: user.email,
      isPaid: user.isPaid,
      charityPreference: user.charityPreference,
      currentScore,
      ppr,
      tps: currentScore + ppr,
      teamsRemaining,
      picks,
    }
  })

  entries.sort((a, b) => b.tps - a.tps || b.currentScore - a.currentScore || a.name.localeCompare(b.name))

  return entries.map((e, i) => ({ ...e, rank: i + 1 }))
}

// Games at each checkpoint for display in scores view
export interface DemoGame {
  id: string
  round: string
  roundNum: number
  homeTeam: { id: string; name: string; shortName: string; seed: number; logo: string | null; score: number; winner: boolean }
  awayTeam: { id: string; name: string; shortName: string; seed: number; logo: string | null; score: number; winner: boolean }
  status: "pre" | "final" | "upset"
  isUpset: boolean // higher seed won
}

// Generate a plausible score given seed (lower seed = lower score generally)
function fakeScore(seed: number, winner: boolean): number {
  const base = winner ? 72 + Math.floor(Math.random() * 12) : 65 + Math.floor(Math.random() * 8)
  return Math.max(50, base - seed * 0.5)
}

export function getDemoGamesForRound(roundIdx: number): DemoGame[] {
  if (roundIdx === 0) return [] // Selection Sunday - no games yet

  const roundNames: Record<number, string> = {
    1: "First Round",
    2: "Second Round",
    3: "Sweet Sixteen",
    4: "Elite Eight",
    5: "Final Four",
    6: "National Championship",
    7: "Champion",
  }

  // Return teams that played in this specific round (went from roundIdx-1 to roundIdx)
  const teamsInRound = DEMO_TEAMS.filter((t) => {
    // Team played in this round if they had 0 elim before this round
    // and got their result (win or loss) at this round
    const prevElim = t.elimAtRound[roundIdx - 1]
    return !prevElim // was alive before this round
  })

  // Group by matchup (winner advances, loser is eliminated at this round)
  // Simplification: create fake matchups for display
  const games: DemoGame[] = []
  const processed = new Set<string>()

  teamsInRound.forEach((team) => {
    if (processed.has(team.id)) return
    processed.add(team.id)

    // Find a team they "played" - for demo we pair consecutive seeds in same region
    const opponent = teamsInRound.find((t) => {
      if (processed.has(t.id)) return false
      if (t.region !== team.region) return false
      // Different result at this round: one won (not elim) one lost (elim)
      const teamElim = team.elimAtRound[roundIdx]
      const tElim = t.elimAtRound[roundIdx]
      return teamElim !== tElim
    })

    if (!opponent) {
      // Handle byes or unpaired teams
      processed.add(team.id)
      return
    }

    processed.add(opponent.id)

    const winner = team.elimAtRound[roundIdx] ? opponent : team
    const loser = team.elimAtRound[roundIdx] ? team : opponent
    const isUpset = winner.seed > loser.seed

    games.push({
      id: `${team.id}-vs-${opponent.id}-r${roundIdx}`,
      round: roundNames[roundIdx] ?? `Round ${roundIdx}`,
      roundNum: roundIdx,
      homeTeam: {
        id: winner.id,
        name: winner.name,
        shortName: winner.shortName,
        seed: winner.seed,
        logo: winner.logoUrl,
        score: Math.round(fakeScore(winner.seed, true)),
        winner: true,
      },
      awayTeam: {
        id: loser.id,
        name: loser.name,
        shortName: loser.shortName,
        seed: loser.seed,
        logo: loser.logoUrl,
        score: Math.round(fakeScore(loser.seed, false)),
        winner: false,
      },
      status: "final",
      isUpset,
    })
  })

  return games
}
