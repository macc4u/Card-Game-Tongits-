// Core rules (js/gameLogic.js)
class TongitsRoyale {
  constructor(players) {
    this.players = players;
    this.deck = this.createDeck();
    this.discardPile = [];
    this.turn = 0;
    this.roundActive = true;
  }

  createDeck() {
    const suits = ['♠','♥','♣','♦'];
    const ranks = ['3','4','5','6','7','8','9','10','J','Q','K','A','2'];
    let deck = [];
    suits.forEach(s => ranks.forEach(r => deck.push({rank: r, suit: s, value: this.getCardValue(r)})));
    return this.shuffle(deck);
  }

  getCardValue(rank) {
    const vals = {3:3,4:4,5:5,6:6,7:7,8:8,9:9,10:10,J:10,Q:10,K:10,A:1,2:2};
    return vals[rank];
  }

  shuffle(deck) {
    for (let i = deck.length-1; i>0; i--) {
      const j = Math.floor(Math.random()*(i+1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  dealCards() {
    this.players.forEach((p, i) => {
      p.hand = this.deck.splice(0, i===0 ? 13 : 12);
      p.points = 0;
    });
    this.discardPile.push(this.deck.pop());
  }

  isValidSet(cards) {
    // Valid sets: 3+ same rank, or 3+ consecutive same suit
    if (cards.length <3) return false;
    const ranks = cards.map(c=>c.rank);
    const suits = cards.map(c=>c.suit);
    return ranks.every(r=>r===ranks[0]) || suits.every(s=>s===suits[0]) && this.isSequence(ranks);
  }

  isSequence(ranks) {
    const order = ['3','4','5','6','7','8','9','10','J','Q','K','A','2'];
    const indices = ranks.map(r=>order.indexOf(r)).sort((a,b)=>a-b);
    return indices.every((v,i,a)=>i===0 || v === a[i-1]+1);
  }
}
