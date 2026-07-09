const reactQuoteRoot = document.getElementById('react-quote-root');

let quoteIndex = Number(localStorage.getItem('cy_quote_index') || 0);

const challengeQuotes = [
  { category: 'Discipline & Consistency', text: 'Discipline is choosing what you want most over what you want now.' },
  { category: 'Discipline & Consistency', text: 'Your future is built by what you repeat today.' },
  { category: 'Discipline & Consistency', text: "You don't rise to your goals. You fall to your habits." },
  { category: 'Discipline & Consistency', text: 'Motivation starts the journey. Discipline finishes it.' },
  { category: 'Discipline & Consistency', text: 'Every excuse you make becomes part of your identity.' },
  { category: 'Discipline & Consistency', text: 'Small actions, repeated daily, become unstoppable.' },
  { category: 'Discipline & Consistency', text: "Your habits are voting for the person you'll become." },
  { category: 'Comfort Zone', text: 'Comfort is expensive. Growth is painful. Choose your price.' },
  { category: 'Comfort Zone', text: 'The life you want exists outside your comfort zone.' },
  { category: 'Comfort Zone', text: 'Easy choices create a hard life. Hard choices create an easy life.' },
  { category: 'Comfort Zone', text: 'Fear is often the direction you need to go.' },
  { category: 'Comfort Zone', text: "If it doesn't challenge you, it won't change you." },
  { category: 'Comfort Zone', text: 'Comfort kills ambition quietly.' },
  { category: 'Accountability', text: 'Nobody is coming to save you.' },
  { category: 'Accountability', text: "Your excuses don't care about your dreams." },
  { category: 'Accountability', text: 'You are both the problem and the solution.' },
  { category: 'Accountability', text: "The mirror tells the truth your friends won't." },
  { category: 'Accountability', text: 'Stop negotiating with the version of yourself that wants to quit.' },
  { category: 'Accountability', text: 'Your standards create your life - not your intentions.' },
  { category: 'Hard Work', text: 'Success loves preparation more than talent.' },
  { category: 'Hard Work', text: 'The work you avoid is often the work you need most.' },
  { category: 'Hard Work', text: 'Be addicted to progress, not applause.' },
  { category: 'Hard Work', text: 'Outwork your excuses.' },
  { category: 'Hard Work', text: 'Greatness is built when nobody is watching.' },
  { category: 'Hard Work', text: 'Talent without effort is wasted potential.' },
  { category: 'Mental Toughness', text: 'Pain is temporary. Regret lasts longer.' },
  { category: 'Mental Toughness', text: 'Your mind quits before your body does.' },
  { category: 'Mental Toughness', text: 'Become someone difficult to defeat.' },
  { category: 'Mental Toughness', text: 'Pressure reveals character.' },
  { category: 'Mental Toughness', text: 'Control your mind, or it will control you.' },
  { category: 'Mental Toughness', text: 'Resilience is earned, not inherited.' },
  { category: 'Self-Mastery', text: 'Win the morning. Win the day.' },
  { category: 'Self-Mastery', text: 'Become someone your future self is proud to remember.' },
  { category: 'Self-Mastery', text: "Every decision is a vote for the person you're becoming." },
  { category: 'Self-Mastery', text: 'Master yourself before trying to master the world.' },
  { category: 'Self-Mastery', text: 'The hardest battle is against your own excuses.' },
  { category: 'Self-Mastery', text: 'Discipline is self-respect in action.' },
  { category: 'Success', text: 'Dreams demand receipts called effort.' },
  { category: 'Success', text: 'Results respect consistency.' },
  { category: 'Success', text: 'Success is rented. Rent is due every day.' },
  { category: 'Success', text: 'Stay patient. Stay relentless.' },
  { category: 'Success', text: 'The grind is invisible until the results are undeniable.' },
  { category: 'Success', text: "Your competition is yesterday's version of you." },
  { category: 'Brutal Reality', text: 'No one remembers the plans you made. They remember the work you finished.' },
  { category: 'Brutal Reality', text: "The clock doesn't care how you feel." },
  { category: 'Brutal Reality', text: 'Time will pass whether you improve or not.' },
  { category: 'Brutal Reality', text: 'Potential means nothing without execution.' },
  { category: 'Brutal Reality', text: 'Excuses sound best to the person making them.' },
  { category: 'Brutal Reality', text: 'You either suffer the pain of discipline or the pain of regret.' },
  { category: 'Identity', text: "Don't prove them wrong. Prove yourself right." },
  { category: 'Identity', text: "Build a life that doesn't need validation." },
  { category: 'Identity', text: 'Your identity is shaped by what you repeatedly do.' },
  { category: 'Identity', text: 'Become the person your goals require.' },
  { category: 'Identity', text: 'Respect is earned through actions, not intentions.' },
  { category: 'Identity', text: 'Character is what you do when nobody can see.' },
  { category: 'Warrior Mindset', text: 'The battle is won before the alarm rings.' },
  { category: 'Warrior Mindset', text: 'One more rep. One more page. One more hour.' },
  { category: 'Warrior Mindset', text: 'Be relentless, not reckless.' },
  { category: 'Warrior Mindset', text: 'Weak moments create strong excuses. Strong people create strong habits.' },
  { category: 'Warrior Mindset', text: 'Train your mind to obey your decisions.' },
  { category: 'Warrior Mindset', text: 'Finish what you started.' },
  { category: 'Original Quotes', text: "Every shortcut steals a piece of the person you're trying to become." },
  { category: 'Original Quotes', text: 'The version of you that reaches the goal is built by the days you wanted to quit.' },
  { category: 'Original Quotes', text: "Your comfort zone isn't protecting you - it's imprisoning you." },
  { category: 'Original Quotes', text: "The hardest opponent you'll ever face knows all your excuses because it's you." },
  { category: 'Original Quotes', text: "You don't need more time. You need fewer negotiations with yourself." },
  { category: 'Original Quotes', text: 'Every promise you break to yourself weakens your confidence. Every promise you keep strengthens your identity.' },
  { category: 'Original Quotes', text: 'The gap between who you are and who you could become is paid for with consistent effort.' },
  { category: 'Original Quotes', text: 'You cannot build an extraordinary life with ordinary discipline.' },
  { category: 'Original Quotes', text: "Your future isn't waiting for motivation. It's waiting for action." },
  { category: 'Original Quotes', text: 'Become the person who does what they said they would do - even when nobody is watching.' }
];

function normalizeQuoteIndex(index){
  if(!Number.isFinite(index)) return 0;
  return ((index % challengeQuotes.length) + challengeQuotes.length) % challengeQuotes.length;
}

function QuoteWidget(){
  const e = React.createElement;
  const [index, setIndex] = React.useState(normalizeQuoteIndex(quoteIndex));
  const quote = challengeQuotes[index];

  React.useEffect(()=>{
    quoteIndex = index;
    localStorage.setItem('cy_quote_index', String(index));
  }, [index]);

  React.useEffect(()=>{
    const timer = setInterval(()=>{
      setIndex(current => normalizeQuoteIndex(current + 1));
    }, 9000);
    return ()=>clearInterval(timer);
  }, []);

  function shuffle(){
    if(challengeQuotes.length < 2) return;
    setIndex(current => {
      let nextIndex = current;
      while(nextIndex === current){
        nextIndex = Math.floor(Math.random() * challengeQuotes.length);
      }
      return nextIndex;
    });
  }

  return e(
    'section',
    { className: 'panel quote-panel', 'aria-label': 'Challenge quote' },
    e(
      'div',
      { className: 'quote-header' },
      e(
        'div',
        null,
        e('p', { className: 'eyebrow quote-eyebrow' }, 'Powerful Quote'),
        e('h2', null, quote.category)
      ),
      e(
        'div',
        { className: 'quote-controls' },
        e('button', {
          className: 'btn quote-btn',
          type: 'button',
          'aria-label': 'Previous quote',
          onClick: ()=>setIndex(current => normalizeQuoteIndex(current - 1))
        }, '<'),
        e('button', {
          className: 'btn quote-btn',
          type: 'button',
          onClick: shuffle
        }, 'Shuffle'),
        e('button', {
          className: 'btn quote-btn',
          type: 'button',
          'aria-label': 'Next quote',
          onClick: ()=>setIndex(current => normalizeQuoteIndex(current + 1))
        }, '>')
      )
    ),
    e('p', { className: 'quote-text' }, quote.text)
  );
}

function mountReactQuoteWidget(){
  if(!reactQuoteRoot) return;
  if(!window.React || !window.ReactDOM){
    reactQuoteRoot.innerHTML = '<section class="panel quote-panel"><p class="eyebrow quote-eyebrow">Powerful Quote</p><p class="quote-text">React could not load. Check your internet connection and refresh.</p></section>';
    return;
  }
  ReactDOM.createRoot(reactQuoteRoot).render(React.createElement(QuoteWidget));
}
