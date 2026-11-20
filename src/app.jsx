import NinjaGame from './NinjaGame.jsx';
import BlockObby from './Blockobby.jsx';
import { useState, useEffect } from 'preact/hooks';

const games = [
  {
    id: 'ninja-simulator',
    name: 'Ninja Simulator',
    category: 'Adventure',
    icon: '🥷',
    players: 'Single-player',
    description: 'Train, collect pets, unlock islands and become a ninja.',
    details: 'Train your Ninjitsu, upgrade swords, collect pets, unlock islands and become stronger with every rebirth.',
    color: 'linear-gradient(135deg,#17604e,#25204e)',
    search: 'Ninja Simulator',
    original: true,
  },
  {
    id: 'block-obby',
    name: 'Block Obby',
    category: 'Obby',
    icon: '🏃',
    players: 'Single-player',
    description: 'Jump, dodge hazards and conquer obstacle courses.',
    details: 'Test your platforming skills in a 3D obstacle course. Reach checkpoints, avoid lava and make it to the finish.',
    color: 'linear-gradient(135deg,#17604e,#245b91)',
    search: 'Block Obby',
  },
  {
    id: 1,
    name: 'Brookhaven RP',
    category: 'Roleplay',
    icon: '🏡',
    players: '500K+',
    description: 'Build your own life and explore the city.',
    details: 'Create your own story in Brookhaven. Explore houses, drive vehicles, meet other players, and experience an open-ended roleplay world.',
    color: 'linear-gradient(135deg,#33265c,#263b50)',
    search: 'Brookhaven RP',
  },
  {
    id: 2,
    name: 'Adopt Me!',
    category: 'Roleplay',
    icon: '🐶',
    players: '300K+',
    description: 'Adopt pets, decorate homes and explore.',
    details: 'Discover a world full of pets, homes, and adventures. Collect pets, trade with other players, and create your own home.',
    color: 'linear-gradient(135deg,#49316c,#314b70)',
    search: 'Adopt Me',
  },
  {
    id: 3,
    name: 'Tower of Hell',
    category: 'Obby',
    icon: '🧗',
    players: '80K+',
    description: 'Challenge yourself through difficult towers.',
    details: 'Test your platforming skills in a challenging obstacle course. Climb the tower, overcome difficult jumps, and race against the clock.',
    color: 'linear-gradient(135deg,#45316c,#273b5a)',
    search: 'Tower of Hell',
  },
  {
    id: 4,
    name: 'BedWars',
    category: 'Action',
    icon: '⚔️',
    players: '100K+',
    description: 'Fight teams and protect your bed.',
    details: 'Team up with other players, gather resources, protect your base, and compete against other teams.',
    color: 'linear-gradient(135deg,#283e62,#49316c)',
    search: 'BedWars',
  },
  {
    id: 5,
    name: 'Murder Mystery 2',
    category: 'Survival',
    icon: '🔎',
    players: '90K+',
    description: "Find the murderer before it's too late.",
    details: "Enter a mystery round where players have different roles. Figure out what's happening and survive until the end.",
    color: 'linear-gradient(135deg,#45305d,#243a50)',
    search: 'Murder Mystery 2',
  },
  {
    id: 6,
    name: 'Blox Fruits',
    category: 'Adventure',
    icon: '🍎',
    players: '200K+',
    description: 'Explore islands and discover abilities.',
    details: 'Explore a huge adventure world, discover abilities, travel between islands, and develop your character.',
    color: 'linear-gradient(135deg,#354c65,#49316c)',
    search: 'Blox Fruits',
  },
];

const categories = [
  'All',
  'Roleplay',
  'Action',
  'Obby',
  'Adventure',
  'Survival',
];

const initialFavorites = () => {
  try {
    return JSON.parse(localStorage.getItem('nexus-favorites')) || [];
  } catch {
    return [];
  }
};

export default function App() {
  const [showNinjaGame, setShowNinjaGame] = useState(false);
  const [showBlockObby, setShowBlockObby] = useState(false);
  const [page, setPage] = useState('Discover');
  const [selectedGame, setSelectedGame] = useState(null);
  const [favorites, setFavorites] = useState(initialFavorites);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    localStorage.setItem('nexus-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id) => {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const openGame = (game) => {
    setSelectedGame(game);
    window.scrollTo(0, 0);
  };

  const goBack = () => {
    setSelectedGame(null);
    window.scrollTo(0, 0);
  };

  const visibleGames = games.filter((game) => {
    const matchesCategory = category === 'All' || game.category === category;

    const matchesSearch = game.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesPage = page !== 'Favorites' || favorites.includes(game.id);

    return matchesCategory && matchesSearch && matchesPage;
  });

  const changePage = (newPage) => {
    setPage(newPage);
    setSelectedGame(null);
    setCategory('All');
    setSearch('');
    window.scrollTo(0, 0);
  };

  return (
    <div class="nexus">
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #08090f;
          color: #f5f4fa;
          font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .nexus {
          min-height: 100vh;
          background: #08090f;
          padding-bottom: 110px;
        }

        .nexus-header {
          padding: 25px 25px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nexus-logo {
          font-size: 25px;
          font-weight: 900;
          letter-spacing: 3px;
          color: #a78bfa;
        }

        .nexus-tag {
          color: #88869a;
          font-size: 12px;
          letter-spacing: 2px;
        }

        .nexus-content {
          max-width: 1100px;
          margin: auto;
          padding: 0 20px;
        }

        .nexus-welcome {
          background: linear-gradient(125deg,#211a3e,#302453,#171727);
          border: 1px solid #40335f;
          border-radius: 30px;
          padding: 55px 25px;
          text-align: center;
          margin: 10px 0 55px;
        }

        .nexus-welcome-label {
          color: #bba5ff;
          letter-spacing: 4px;
          font-size: 14px;
          font-weight: 800;
        }

        .nexus-welcome h1 {
          font-size: clamp(30px,6vw,48px);
          line-height: 1.05;
          margin: 25px 0;
          letter-spacing: -2px;
        }

        .nexus-welcome p {
          color: #b6b1c9;
          font-size: 17px;
          line-height: 1.7;
          max-width: 650px;
          margin: auto;
        }

        .nexus-section-title {
          font-size: 26px;
          font-weight: 850;
          margin: 35px 0 25px;
        }

        .nexus-categories {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 18px;
          scrollbar-width: none;
        }

        .nexus-categories::-webkit-scrollbar {
          display: none;
        }

        .nexus-category {
          flex-shrink: 0;
          padding: 17px 25px;
          border-radius: 17px;
          border: 1px solid #282733;
          background: #151520;
          color: #aaa7b9;
          font-size: 16px;
          cursor: pointer;
        }

        .nexus-category.active {
          background: #8055ed;
          color: white;
          border-color: #a78bfa;
        }

        .nexus-search {
          width: 100%;
          padding: 17px 20px;
          border-radius: 15px;
          border: 1px solid #302c40;
          background: #151520;
          color: white;
          font-size: 16px;
          outline: none;
          margin: 5px 0 25px;
        }

        .nexus-grid {
          display: grid;
          grid-template-columns: repeat(2,minmax(0,1fr));
          gap: 18px;
        }

        .nexus-card {
          background: #14141f;
          border: 1px solid #292837;
          border-radius: 27px;
          overflow: hidden;
          min-width: 0;
        }

        .nexus-card-art {
          height: 190px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 75px;
          cursor: pointer;
        }

        .nexus-card-body {
          padding: 22px 18px;
        }

        .nexus-card h3 {
          text-align: center;
          font-size: 19px;
          margin: 2px 0 22px;
        }

        .nexus-card-category {
          color: #a78bfa;
          text-align: center;
          font-size: 14px;
          margin-bottom: 24px;
        }

        .nexus-card-description {
          color: #9290a2;
          text-align: center;
          line-height: 1.6;
          min-height: 50px;
          font-size: 14px;
        }

        .nexus-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          margin-top: 22px;
          color: #9290a2;
          font-size: 13px;
        }

        .nexus-save {
          background: #191923;
          border: 1px solid #454252;
          border-radius: 13px;
          padding: 12px;
          color: white;
          cursor: pointer;
          white-space: nowrap;
        }

        .nexus-save.saved {
          color: #b69aff;
          border-color: #8660e9;
        }

        .nexus-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 10;
          display: flex;
          justify-content: space-around;
          background: rgba(18,17,29,.96);
          border-top: 1px solid #343044;
          padding: 13px 5px max(15px,env(safe-area-inset-bottom));
          backdrop-filter: blur(18px);
        }

        .nexus-nav button {
          background: transparent;
          border: 0;
          color: #9995aa;
          padding: 13px 10px;
          border-radius: 17px;
          font-size: 13px;
          cursor: pointer;
        }

        .nexus-nav button.active {
          color: white;
          background: #292044;
          box-shadow: inset 3px 0 #a78bfa;
        }

        .nexus-detail {
          padding: 20px 0 40px;
        }

        .nexus-back {
          background: #191823;
          color: white;
          border: 1px solid #383447;
          border-radius: 13px;
          padding: 13px 20px;
          font-size: 15px;
          margin-bottom: 25px;
          cursor: pointer;
        }

        .nexus-detail-art {
          height: 280px;
          border-radius: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 110px;
          border: 1px solid #39334f;
        }

        .nexus-detail-category {
          color: #b69aff;
          font-weight: 700;
          margin-top: 30px;
          letter-spacing: 2px;
          text-transform: uppercase;
          font-size: 13px;
        }

        .nexus-detail h1 {
          font-size: 34px;
          margin: 12px 0;
        }

        .nexus-detail-description {
          color: #aaa7b9;
          font-size: 16px;
          line-height: 1.8;
        }

        .nexus-detail-info {
          display: flex;
          gap: 12px;
          margin: 25px 0;
          flex-wrap: wrap;
        }

        .nexus-info-box {
          background: #171621;
          border: 1px solid #302d3c;
          padding: 17px;
          border-radius: 15px;
          color: #bcb7ce;
          flex: 1;
          min-width: 110px;
        }

        .nexus-play {
          display: block;
          width: 100%;
          background: linear-gradient(100deg,#8255ee,#a26aff);
          color: white;
          border: 0;
          border-radius: 16px;
          padding: 19px;
          font-size: 18px;
          font-weight: 800;
          cursor: pointer;
          margin: 25px 0 12px;
        }

        .nexus-detail-favorite {
          width: 100%;
          padding: 17px;
          border: 1px solid #51446f;
          background: #191725;
          color: #c5b4ff;
          border-radius: 15px;
          font-size: 16px;
          cursor: pointer;
        }

        .nexus-empty {
          text-align: center;
          padding: 65px 15px;
          color: #9692a5;
        }

        .nexus-empty-icon {
          font-size: 55px;
          margin-bottom: 15px;
        }

        @media(max-width:600px) {
          .nexus-content {
            padding: 0 14px;
          }

          .nexus-welcome {
            padding: 50px 18px;
            margin-bottom: 45px;
          }

          .nexus-grid {
            gap: 12px;
          }

          .nexus-card-art {
            height: 145px;
            font-size: 65px;
          }

          .nexus-card-body {
            padding: 17px 11px;
          }

          .nexus-card h3 {
            font-size: 16px;
          }

          .nexus-card-footer {
            font-size: 11px;
          }

          .nexus-save {
            padding: 10px;
            font-size: 12px;
          }

          .nexus-detail-art {
            height: 230px;
          }
        }
      `}</style>

      <header class="nexus-header">
        <div class="nexus-logo">NEXUS</div>
        <div class="nexus-tag">YOUR GAMING WORLD</div>
      </header>

      <main class="nexus-content">
        {showNinjaGame ? (
          <section class="nexus-detail">
            <button class="nexus-back" onClick={() => setShowNinjaGame(false)}>
              ← Back to NEXUS
            </button>
            <NinjaGame />
          </section>
        ) : showBlockObby ? (
          <section class="nexus-detail">
            <button class="nexus-back" onClick={() => setShowBlockObby(false)}>
              ← Back to NEXUS
            </button>
            <BlockObby />
          </section>
        ) : selectedGame ? (
          <section class="nexus-detail">
            <button class="nexus-back" onClick={goBack}>
              ← Back to {page}
            </button>

            <div
              class="nexus-detail-art"
              style={{ background: selectedGame.color }}
            >
              {selectedGame.icon}
            </div>

            <div class="nexus-detail-category">{selectedGame.category}</div>

            <h1>{selectedGame.name}</h1>

            <p class="nexus-detail-description">{selectedGame.details}</p>

            <div class="nexus-detail-info">
              <div class="nexus-info-box">
                <div>👥</div>
                <strong>{selectedGame.players}</strong>
                <div>Players</div>
              </div>

              <div class="nexus-info-box">
                <div>🎮</div>
                <strong>Roblox</strong>
                <div>Platform</div>
              </div>
            </div>

            <button
              class="nexus-play"
              onClick={() => {
                if (selectedGame.name === "Ninja Simulator") {
                  setShowNinjaGame(true);
                } else {
                  window.open(
                    'https://www.roblox.com/discover/?Keyword=' +
                      encodeURIComponent(selectedGame.search),
                    '_blank'
                  );
                }
              }}
            >
              ▶ Play
            </button>

            <button
              class="nexus-detail-favorite"
              onClick={() => toggleFavorite(selectedGame.id)}
            >
              {favorites.includes(selectedGame.id)
                ? '♥ Remove from Favorites'
                : '♡ Add to Favorites'}
            </button>
          </section>
        ) : (
          <>
            {page === 'Discover' && (
              <section class="nexus-welcome">
                <div class="nexus-welcome-label">WELCOME TO NEXUS</div>

                <h1>
                  Your gaming world.
                  <br />
                  One destination.
                </h1>

                <p>
                  Discover experiences, organize your favorites, and create your
                  own personalized gaming library.
                </p>
              </section>
            )}

            <h2 class="nexus-section-title">
              {page === 'Discover' && 'Explore experiences'}
              {page === 'Library' && 'Your gaming library'}
              {page === 'Favorites' && 'Your favorites'}
              {page === 'Settings' && 'Settings'}
            </h2>

            {page === 'Settings' ? (
              <div class="nexus-info-box">
                <h3>NEXUS</h3>
                <p>Your personal gaming destination.</p>
                <p>Version 1.0.0</p>
                <p>Favorites saved locally on this device.</p>
              </div>
            ) : (
              <>
                <input
                  class="nexus-search"
                  placeholder="Search games..."
                  value={search}
                  onInput={(event) => setSearch(event.target.value)}
                />

                {page === 'Discover' && (
                  <div class="nexus-categories">
                    {categories.map((item) => (
                      <button
                        class={
                          'nexus-category ' +
                          (category === item ? 'active' : '')
                        }
                        onClick={() => setCategory(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}

                {visibleGames.length > 0 ? (
                  <div class="nexus-grid">
                    {visibleGames.map((game) => (
                      <article class="nexus-card">
                        <div
                          class="nexus-card-art"
                          style={{ background: game.color }}
                          onClick={() => openGame(game)}
                        >
                          {game.icon}
                        </div>

                        <div class="nexus-card-body">
                          <h3
                            onClick={() => openGame(game)}
                            style={{ cursor: 'pointer' }}
                          >
                            {game.name}
                          </h3>

                          <div class="nexus-card-category">{game.category}</div>

                          <p class="nexus-card-description">
                            {game.description}
                          </p>

                          <div class="nexus-card-footer">
                            <span>● {game.players}</span>

                            <button
                              class={
                                'nexus-save ' +
                                (favorites.includes(game.id) ? 'saved' : '')
                              }
                              onClick={() => toggleFavorite(game.id)}
                            >
                              {favorites.includes(game.id)
                                ? '♥ Saved'
                                : '♡ Save'}
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div class="nexus-empty">
                    <div class="nexus-empty-icon">🎮</div>
                    <h3>Nothing here yet</h3>
                    <p>Try another search or explore more games.</p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      {!selectedGame && (
        <nav class="nexus-nav">
          {[
            ['Discover', '◇'],
            ['Library', '▣'],
            ['Favorites', '♡'],
            ['Settings', '⚙'],
          ].map(([name, icon]) => (
            <button
              class={page === name ? 'active' : ''}
              onClick={() => changePage(name)}
            >
              {icon} &nbsp; {name}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
