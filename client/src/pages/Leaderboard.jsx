const users = [
  {
    rank: "1st",
    name: "Admin User",
    points: 1000,
    badges: ["Admin", "Platform Creator"],
    letter: "A",
    highlight: "gold"
  },
  {
    rank: "2nd",
    name: "Arjun Sharma",
    points: 850,
    badges: ["Fast Solver", "DSA Master"],
    letter: "A",
    highlight: "silver"
  },
  {
    rank: "3rd",
    name: "Priya Patel",
    points: 720,
    badges: ["Consistent Learner"],
    letter: "P",
    highlight: "bronze"
  },
  {
    rank: "#4",
    name: "Rohit Kumar",
    points: 600,
    badges: [],
    letter: "R"
  },
  {
    rank: "#5",
    name: "Sneha Gupta",
    points: 580,
    badges: ["Fast Solver"],
    letter: "S"
  },
  {
    rank: "#6",
    name: "Harish Bala",
    points: 550,
    badges: ["You"],
    letter: "H"
  }
];

export default function Leaderboard() {
  return (
    <div className="leaderboard">

      <h1>🏆 Leaderboard</h1>
      <p className="sub">See how you stack up</p>

      {/* TABS */}
      <div className="tabs">
        <button className="active">All Time</button>
        <button>This Week</button>
        <button>Today</button>
      </div>

      {/* LIST */}
      <div className="leaderboard-list">

        {users.map((u, index) => (
          <div key={index} className="leader-card">

            {/* LEFT */}
            <div className="left">
              <span className={`rank ${u.highlight || ""}`}>
                {u.rank}
              </span>

              <div className="avatar">{u.letter}</div>

              <div>
                <h3>{u.name}</h3>

                <div className="badges">
                  {u.badges.map((b, i) => (
                    <span key={i} className="badge">{b}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="right">
              <h3>{u.points} pts</h3>
            </div>

          </div>
        ))}

      </div>

    </div>
  );
}