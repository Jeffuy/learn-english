function parseConcepts(source) {
  return source
    .trim()
    .split("\n")
    .map((line) => {
      const [answer, clue] = line.split("|");
      return { answer: answer.trim(), clue: clue.trim() };
    });
}

function conceptQuiz({ id, name, description, icon, prompt, concepts }) {
  const entries = parseConcepts(concepts);
  if (entries.length !== 50) {
    throw new Error(`${name} must contain exactly 50 concepts; found ${entries.length}.`);
  }

  const answers = entries.map(({ answer }) => answer);
  const questions = entries.map(({ answer, clue }, index) => {
    const distractors = [];
    let offset = 1;
    while (distractors.length < 3) {
      const candidate = answers[(index + offset * 7) % answers.length];
      if (candidate !== answer && !distractors.includes(candidate)) {
        distractors.push(candidate);
      }
      offset += 1;
    }
    const options = [answer, ...distractors];
    const rotation = index % options.length;

    return {
      id: `${id}-${String(index + 1).padStart(2, "0")}`,
      conceptId: `${id}:${answer.toLowerCase()}`,
      sentence: prompt(clue),
      answer,
      options: [...options.slice(rotation), ...options.slice(0, rotation)],
      hint: name,
    };
  });

  return {
    name,
    description,
    icon,
    kind: "focused",
    questions,
  };
}

function questionQuiz({ id, name, description, icon, questions }) {
  if (questions.length !== 50) {
    throw new Error(`${name} must contain exactly 50 questions; found ${questions.length}.`);
  }
  return {
    name,
    description,
    icon,
    kind: "focused",
    questions: questions.map((question, index) => ({
      ...question,
      id: `${id}-${String(index + 1).padStart(2, "0")}`,
      conceptId: `${id}:concept-${String(index + 1).padStart(2, "0")}`,
      hint: name,
    })),
  };
}

function rotatedOptions(correct, alternatives, index) {
  const options = [...new Set([correct, ...alternatives])];
  const fallbackForms = [
    `to ${correct}`,
    `not ${correct}`,
    `being ${correct}`,
    `have ${correct}`,
  ];
  for (const fallback of fallbackForms) {
    if (options.length >= 4) break;
    if (!options.includes(fallback)) options.push(fallback);
  }
  options.splice(4);
  const rotation = index % 4;
  return [...options.slice(rotation), ...options.slice(0, rotation)];
}

const expressionPrompt = (clue) => `The expression meaning “${clue}” is ___.`;
const termPrompt = (clue) => `The term for ${clue} is ___.`;
const wordPrompt = (clue) => `The word meaning “${clue}” is ___.`;

const phrasalVerbs = conceptQuiz({
  id: "phrasal-verbs",
  name: "Phrasal Verbs",
  description: "Meaning and use of common phrasal verbs",
  icon: "🔗",
  prompt: expressionPrompt,
  concepts: `
bring up|introduce a subject in conversation
call off|cancel a planned event
carry on|continue doing something
come across|find something unexpectedly
come up with|produce an idea or solution
cut down on|reduce the amount you use
drop off|take someone somewhere and leave them there
figure out|understand or solve something
fill in|complete missing information on a form
find out|discover a fact
get along with|have a friendly relationship with someone
get away with|avoid punishment for something wrong
get over|recover from an illness or disappointment
give up|stop trying or abandon a habit
go over|review something carefully
grow up|develop from a child into an adult
hand in|submit work to a teacher
hold on|wait for a short time
keep up with|stay at the same level or speed
look after|take care of someone or something
look forward to|feel excited about a future event
look into|investigate a situation
look up|search for information
make up|invent a story that is not true
pick up|collect someone or learn something informally
point out|draw attention to a fact
put off|delay doing something
run into|meet someone unexpectedly
run out of|use all of something so none remains
set off|begin a journey
set up|arrange or establish something
show up|arrive at a place
sort out|resolve a problem
speak up|talk more loudly
take after|resemble an older relative
take off|leave the ground or remove clothing
take on|accept a responsibility or challenge
think over|consider something carefully
throw away|put something in the rubbish
try out|test something to see if it works
turn down|refuse an offer or reduce volume
turn into|change from one thing to another
turn up|arrive unexpectedly or increase volume
work out|find a solution or exercise
break down|stop functioning
break out|start suddenly, especially a fire or disease
check in|register when arriving at a hotel or airport
check out|examine something or leave a hotel
come back|return to a place
deal with|take action to handle a problem
`,
});

const artPhenomena = conceptQuiz({
  id: "art-natural-phenomena",
  name: "Art & Unusual Phenomena",
  description: "Art, colour, places and extraordinary natural events",
  icon: "🌌",
  prompt: termPrompt,
  concepts: `
aurora|coloured lights appearing naturally in a polar sky
bioluminescence|light produced by a living organism
eclipse|an event in which one space object blocks another
mirage|an optical image caused by hot air bending light
geyser|a spring that shoots hot water and steam upwards
meteor shower|many bright space rocks appearing in the night sky
waterspout|a spinning column of air and water over the sea
rainbow|an arc of colours created when light passes through water drops
halo|a ring of light seen around the sun or moon
lightning|a sudden electrical flash in the atmosphere
avalanche|a large mass of snow moving rapidly downhill
whirlpool|water moving rapidly in a circular motion
glacier|a huge, slowly moving mass of ice
volcano|a mountain that can release lava and ash
stalactite|a mineral formation hanging from a cave roof
stalagmite|a mineral formation growing from a cave floor
horizon|the apparent line where the land or sea meets the sky
reflection|an image produced by light bouncing from a surface
shadow|a dark shape made when an object blocks light
silhouette|a dark outline seen against a lighter background
portrait|an artwork representing a particular person
landscape|an artwork showing natural scenery
still life|an artwork showing arranged objects such as fruit or flowers
mural|a large picture painted directly on a wall
sculpture|a three-dimensional work of art
collage|art made by attaching different materials to a surface
installation|an artwork designed for a particular space
canvas|strong cloth used as a surface for painting
palette|a board used for mixing an artist’s colours
easel|a stand that supports a picture while it is being painted
sketch|a quick drawing showing the main features
shade|a particular form of a colour
texture|the visual or physical quality of a surface
perspective|a technique that creates an impression of depth
foreground|the part of an image that appears nearest
background|the part of an image behind the main subject
exhibition|a public display of works of art
gallery|a building or room where art is displayed
curator|a person responsible for a museum collection
masterpiece|an artist’s exceptionally successful work
abstract art|art using shapes and colours rather than realistic images
watercolour|paint mixed with water to create transparent colour
oil paint|slow-drying paint made with coloured pigments and oil
ceramics|objects made from clay and hardened by heat
engraving|an image created by cutting a design into a hard surface
symmetry|balanced matching parts on opposite sides
contrast|a strong difference between visual elements
composition|the arrangement of elements within an artwork
pigment|a substance that gives paint its colour
optical illusion|an image that causes the eye to misinterpret reality
`,
});

const film = conceptQuiz({
  id: "film",
  name: "Film & Visual Storytelling",
  description: "Cinema, performance and visual storytelling vocabulary",
  icon: "🎞️",
  prompt: termPrompt,
  concepts: `
actor|a person who performs a character
audition|a performance used to select someone for a role
cast|all the performers in a film
character|a person represented in a story
cinematography|the artistic work of filming images
close-up|a shot showing a subject from very near
costume|clothing worn by a performer
credits|the list of people who worked on a film
director|the person controlling the artistic production
documentary|a factual film about real people or events
dub|replace the original speech with another language
editing|selecting and joining recorded shots
extra|a performer with a small background role
feature film|a full-length film made for cinema
flashback|a scene showing an earlier time
genre|a category such as comedy, horror or drama
location|a real place where filming happens
make-up|cosmetics used to change a performer’s appearance
montage|a sequence of short shots showing development
narrator|a voice or person telling the story
opening scene|the first section of a film
plot|the connected events that form a story
premiere|the first public showing of a film
producer|the person managing money and organisation
prop|an object used by an actor in a scene
review|an evaluation of a film
role|the character played by a performer
scene|one continuous section of dramatic action
screenplay|the written text for a film
sequel|a film continuing an earlier story
set|the constructed place where a scene is filmed
soundtrack|the music and recorded sound in a film
special effects|artificial images or events created for a film
spoiler|information that reveals an important plot event
stunt|a dangerous action performed for entertainment
subtitles|written dialogue shown at the bottom of a screen
trailer|a short advertisement for a future film
voice-over|speech heard without seeing the speaker
wide shot|a shot showing a broad view of a setting
box office|the place or system where cinema tickets are sold
cliffhanger|an ending leaving an important question unresolved
comedy|a film intended to make people laugh
horror film|a film intended to frighten viewers
lighting|the deliberate use of light in a scene
period drama|a story set in a particular historical time
remake|a new version of an older film
screening|an occasion when a film is shown
supporting actor|a performer in an important but secondary role
visual effects|digitally created or altered screen images
wardrobe|the collection of clothes used in a production
`,
});

const photography = conceptQuiz({
  id: "photography",
  name: "Photography",
  description: "Cameras, images and black-and-white photography",
  icon: "📸",
  prompt: termPrompt,
  concepts: `
aperture|the opening controlling how much light enters a camera
autofocus|a system that makes a camera focus automatically
background|the area behind the main photographic subject
black-and-white|a photographic style using tones without colour
blur|a lack of sharp detail in an image
brightness|the amount of light visible in an image
camera body|the main part of a camera excluding the lens
candid photograph|an unposed picture taken naturally
close-up|a photograph taken from a very short distance
composition|the arrangement of visual elements in a picture
contrast|the difference between light and dark areas
crop|remove the outer parts of an image
depth of field|the distance range that appears acceptably sharp
digital zoom|software enlargement of part of an image
editing|altering an image after it has been taken
exposure|the total amount of light reaching the camera sensor
filter|an accessory or effect changing captured light or colour
flash|a brief artificial light used when taking a photograph
focus|the state in which image details appear sharp
foreground|the area of a photograph nearest the viewer
frame|the edges and selected area of a photograph
golden hour|the period after sunrise or before sunset with soft light
highlight|a very bright area within an image
image stabilisation|technology reducing blur caused by camera movement
landscape photograph|a picture showing a broad natural scene
lens|the curved glass directing light into a camera
macro photography|photography of very small subjects at close range
manual mode|a camera setting giving the photographer full control
memory card|a removable device storing digital photographs
negative|a reversed image traditionally used to produce prints
panorama|a photograph showing an exceptionally wide view
perspective|the apparent spatial relationship between objects
pixel|the smallest coloured unit in a digital image
portrait|a photograph whose main subject is a person
print|a physical copy of a photograph on paper
reflection|an image seen in water, glass or another shiny surface
resolution|the amount of detail contained in a digital image
rule of thirds|a composition guide dividing an image into nine sections
self-timer|a camera setting delaying the moment a picture is taken
sensor|the electronic surface recording light in a digital camera
shadow|a dark area where light is blocked
shutter|the mechanism controlling how long light enters a camera
shutter speed|the length of time a camera sensor is exposed
silhouette|a dark subject photographed against a bright background
snapshot|a quick informal photograph
tripod|a three-legged support used to keep a camera steady
viewfinder|the part used to see and compose the future photograph
wide-angle lens|a lens capturing a broader view than normal
wildlife photography|photography whose subjects are animals in nature
zoom lens|a lens allowing different focal lengths
  `,
});

const negativePrefixes = conceptQuiz({
  id: "negative-prefixes",
  name: "Negative Prefixes",
  description: "Form opposites with un-, in-, im-, il-, ir- and dis-",
  icon: "➖",
  prompt: wordPrompt,
  concepts: `
unable|not capable of doing something
unacceptable|not satisfactory or permitted
unaware|not knowing about something
uncertain|not sure or confident
uncomfortable|not physically relaxed
uncommon|not frequently found
unconscious|not awake or aware
unfair|not treating people equally
unfamiliar|not known or recognised
unfortunate|having bad luck
unhealthy|not good for physical well-being
unhelpful|not providing useful assistance
unimportant|not having much significance
unlikely|not expected to happen
unnecessary|not needed
unpleasant|not enjoyable or agreeable
unpopular|not liked by many people
unpredictable|not possible to forecast reliably
unreasonable|not based on good judgment
unsuccessful|not achieving the intended result
inaccurate|not correct or exact
inadequate|not sufficient for a purpose
inappropriate|not suitable for a situation
incomplete|not containing every necessary part
inconvenient|causing difficulty or trouble
indirect|not following the shortest or clearest route
inexperienced|lacking practical knowledge
informal|not following official or formal conventions
insecure|not confident or protected
insensitive|not considering other people’s feelings
invisible|not able to be seen
impatient|unable to wait calmly
imperfect|containing faults or weaknesses
impolite|not showing good manners
impossible|not able to happen or be done
impractical|not sensible or useful in real conditions
immature|not behaving with adult responsibility
illegal|forbidden by law
illogical|not following sensible reasoning
illegible|not clear enough to be read
irregular|not following a consistent pattern
irrelevant|not connected with the subject
irresponsible|not behaving with proper care
irreversible|not possible to change back
dishonest|not truthful
disloyal|not faithful to a person or group
disobedient|refusing to follow rules or instructions
disorganised|not arranged in an orderly way
disrespectful|not showing proper respect
dissatisfied|not pleased with a result or situation
`,
});

const makeDo = conceptQuiz({
  id: "make-do",
  name: "Make & Do",
  description: "Choose the natural expression with make or do",
  icon: "🛠️",
  prompt: expressionPrompt,
  concepts: `
make a decision|choose after considering the possibilities
make a difference|have an important positive effect
make a mistake|do something incorrectly
make a promise|give someone a firm assurance
make a suggestion|offer an idea for consideration
make an effort|try hard to achieve something
make progress|move closer to completing a goal
make a complaint|formally say that something is wrong
make an appointment|arrange a particular time to meet
make an excuse|give a reason to avoid blame
make a profit|earn more money than was spent
make a loss|spend more money than was earned
make a choice|select one possibility
make a plan|decide in advance what to do
make a phone call|contact someone by telephone
make friends|develop friendly relationships
make a contribution|give something that helps a shared effort
make an impression|cause people to form a particular opinion
make a discovery|find something previously unknown
make a prediction|say what you think will happen
make a reservation|arrange for a place to be kept for you
make a speech|speak formally to an audience
make a list|write several related items in order
make money|earn an income
make room|create enough space for someone or something
do homework|complete school work outside class
do research|study a subject to discover information
do business|buy, sell or work commercially
do exercise|perform physical activity
do someone a favour|help another person voluntarily
do the shopping|buy the things needed at home
do the washing-up|clean plates and cooking equipment
do your best|try as hard as possible
do damage|cause physical harm
do a course|study a planned series of lessons
do an experiment|carry out a scientific test
do a job|perform a particular piece of work
do housework|complete cleaning and other home tasks
do well|achieve a successful result
do badly|achieve a poor result
do your duty|perform what you are responsible for
do a test|complete an assessment
do the cooking|prepare food for a meal
do the cleaning|remove dirt from a place
do paperwork|complete administrative documents
do a project|complete an organised piece of work
do your hair|arrange or style your hair
do nothing|take no action
do overtime|work beyond normal hours
do the right thing|act in the morally correct way
`,
});

const nounSuffixes = conceptQuiz({
  id: "noun-suffixes",
  name: "Noun Suffixes",
  description: "Build nouns with common suffixes",
  icon: "🔤",
  prompt: wordPrompt,
  concepts: `
achievement|something successfully completed after effort
agreement|a shared decision or arrangement
amazement|a feeling of great surprise
announcement|a public or official statement
appearance|the way someone or something looks
application|a formal request for something
argument|a disagreement involving opposing opinions
arrangement|a plan prepared in advance
attendance|the fact of being present
awareness|knowledge that a situation exists
behaviour|the way a person acts
celebration|an enjoyable event marking an occasion
choice|an act of selecting between possibilities
collection|a group of related objects gathered together
communication|the exchange of information
competition|an event in which people try to win
confidence|belief in your own abilities
connection|a relationship or link between things
creativity|the ability to produce original ideas
decision|a choice made after consideration
development|a process of growth or improvement
difference|a way in which things are not the same
education|the process of teaching and learning
employment|paid work
encouragement|support that gives someone confidence
entertainment|activities designed to interest or amuse
environment|the natural world or surrounding conditions
equipment|the tools needed for an activity
excitement|a feeling of enthusiasm and eagerness
explanation|a statement making something clear
friendship|a close relationship between friends
government|the group that officially controls a country
happiness|the state of feeling pleased
improvement|a change that makes something better
independence|freedom from another person’s control
information|facts communicated or learned
instruction|a direction explaining what to do
invention|a newly created device or process
knowledge|information and understanding gained through learning
leadership|the ability to guide a group
membership|the state of belonging to an organisation
movement|an act of changing position
originality|the quality of being new and unusual
performance|an act of presenting music, drama or another skill
permission|official approval to do something
possibility|something that may happen
preparation|work done to get ready
relationship|the way people or things are connected
responsibility|a duty to deal with something properly
solution|an answer to a problem
`,
});

const compoundWords = conceptQuiz({
  id: "compound-words",
  name: "Compound Words",
  description: "Build and recognise common compound words",
  icon: "🧲",
  prompt: wordPrompt,
  concepts: `
airport|a place where aircraft arrive and depart
background|the area behind the main subject
bedroom|a room used mainly for sleeping
bookshop|a store that sells books
breakdown|a failure of a machine or system
breakfast|the first meal of the day
classroom|a room where lessons take place
cupboard|a storage space with shelves and doors
daylight|natural light during the day
doorway|the opening where a door is fitted
earthquake|a sudden movement of the ground
eyewitness|a person who directly sees an event
firework|an explosive device producing coloured light
football|a sport played by kicking a round ball
greenhouse|a glass building used for growing plants
haircut|the style produced by cutting hair
headache|pain felt in the head
headphones|equipment worn over the ears for listening
homework|school work completed outside class
keyboard|a set of keys used to type on a computer
laptop|a portable computer
lifetime|the period for which a person lives
moonlight|light reaching Earth from the moon
newspaper|printed pages containing news
nightlife|entertainment available during the evening
notebook|a small book used for writing notes
online|connected through the internet
password|a secret word used to access a system
raincoat|a waterproof coat
rainfall|the amount of rain received
seaside|an area beside the sea
smartphone|a mobile phone with advanced computer functions
snowfall|the amount of snow falling in a place
sunlight|natural light coming from the sun
sunrise|the time when the sun first appears
sunset|the time when the sun disappears below the horizon
teaspoon|a small spoon used for drinks or measurements
toothbrush|a small brush used for cleaning teeth
traffic jam|a line of vehicles moving very slowly
underground|a railway system running below a city
underwater|located below the surface of water
website|a collection of connected pages on the internet
weekend|Saturday and Sunday considered together
wheelchair|a chair with wheels for someone unable to walk
wildlife|animals and plants living naturally
windmill|a building whose blades are turned by wind
workplace|a location where people do their jobs
worldwide|existing or happening throughout the world
handmade|created by hand rather than a machine
well-known|recognised by many people
  `,
});

const tenseVerbs = [
  ["Maya", "paint", "paints", "painting", "painted", "painted", "a mural"],
  ["Leo", "check", "checks", "checking", "checked", "checked", "the forecast"],
  ["Nora", "write", "writes", "writing", "wrote", "written", "a review"],
  ["Ben", "take", "takes", "taking", "took", "taken", "photographs"],
  ["Sofia", "study", "studies", "studying", "studied", "studied", "English"],
  ["Omar", "organise", "organises", "organising", "organised", "organised", "the event"],
  ["Grace", "design", "designs", "designing", "designed", "designed", "a poster"],
  ["Daniel", "record", "records", "recording", "recorded", "recorded", "a podcast"],
  ["Emma", "visit", "visits", "visiting", "visited", "visited", "the gallery"],
  ["James", "prepare", "prepares", "preparing", "prepared", "prepared", "a presentation"],
];

const presentQuestions = tenseVerbs.flatMap(
  ([subject, base, third, ing, past, participle, object], index) => {
    const forms = [base, third, `is ${ing}`, `has ${participle}`, `has been ${ing}`, past];
    return [
      {
        sentence: `${subject} usually ___ ${object} on Fridays.`,
        answer: third,
        options: rotatedOptions(third, [base, `is ${ing}`, past], index),
      },
      {
        sentence: `Look! ${subject} ___ ${object} right now.`,
        answer: `is ${ing}`,
        options: rotatedOptions(`is ${ing}`, [third, `has ${participle}`, past], index + 1),
      },
      {
        sentence: `${subject} ___ ${object} three times so far.`,
        answer: `has ${participle}`,
        options: rotatedOptions(`has ${participle}`, [third, `is ${ing}`, past], index + 2),
      },
      {
        sentence: `${subject} ___ ${object} since early this morning.`,
        answer: `has been ${ing}`,
        options: rotatedOptions(`has been ${ing}`, [third, `is ${ing}`, `has ${participle}`], index + 3),
      },
      {
        sentence: `Every month, ${subject} ___ ${object} for the school website.`,
        answer: third,
        options: rotatedOptions(third, forms.filter((form) => form !== third), index + 4),
      },
    ];
  },
);

const presentTenses = questionQuiz({
  id: "present-tenses",
  name: "Present Tenses",
  description: "Present simple, continuous and perfect forms",
  icon: "⏱️",
  questions: presentQuestions,
});

const pastQuestions = tenseVerbs.flatMap(
  ([subject, base, , ing, past, participle, object], index) => [
    {
      sentence: `${subject} ___ ${object} yesterday afternoon.`,
      answer: past,
      options: rotatedOptions(past, [base, `was ${ing}`, `had ${participle}`], index),
    },
    {
      sentence: `${subject} ___ ${object} when the lights went out.`,
      answer: `was ${ing}`,
      options: rotatedOptions(`was ${ing}`, [past, `had ${participle}`, base], index + 1),
    },
    {
      sentence: `${subject} ___ ${object} before the teacher arrived.`,
      answer: `had ${participle}`,
      options: rotatedOptions(`had ${participle}`, [past, `was ${ing}`, base], index + 2),
    },
    {
      sentence: `${subject} used to ___ ${object} during primary school.`,
      answer: base,
      options: rotatedOptions(base, [past, ing, participle], index + 3),
    },
    {
      sentence: `During the summer holidays, ${subject} would ___ ${object} every week.`,
      answer: base,
      options: rotatedOptions(base, [past, ing, participle], index + 4),
    },
  ],
);

const pastTenses = questionQuiz({
  id: "past-tenses",
  name: "Past Tenses",
  description: "Past simple, continuous, perfect and past habits",
  icon: "⏪",
  questions: pastQuestions,
});

const futureQuestions = tenseVerbs.flatMap(
  ([subject, base, , ing, , participle, object], index) => [
    {
      sentence: `${subject} thinks the class will ___ ${object} tomorrow.`,
      answer: base,
      options: rotatedOptions(base, [ing, participle, `to ${base}`], index),
    },
    {
      sentence: `${subject} is going to ___ ${object} this weekend.`,
      answer: base,
      options: rotatedOptions(base, [ing, participle, `to ${base}`], index + 1),
    },
    {
      sentence: `${subject} is ___ ${object} with the team at six o’clock.`,
      answer: ing,
      options: rotatedOptions(ing, [base, participle, `to ${base}`], index + 2),
    },
    {
      sentence: `At this time tomorrow, ${subject} will be ___ ${object}.`,
      answer: ing,
      options: rotatedOptions(ing, [base, participle, `to ${base}`], index + 3),
    },
    {
      sentence: `By Friday, ${subject} will have ___ ${object}.`,
      answer: participle,
      options: rotatedOptions(participle, [base, ing, `to ${base}`], index + 4),
    },
  ],
);

const futureForms = questionQuiz({
  id: "future-forms",
  name: "Future Forms",
  description: "Plans, predictions, arrangements and future perfect forms",
  icon: "🔮",
  questions: futureQuestions,
});

const conditionalSituations = [
  ["water", "reach", "reaches", "100°C", "boil", "boils", "boiled"],
  ["people", "recycle", "recycle", "more", "reduce", "reduce", "reduced"],
  ["Maya", "leave", "leaves", "early", "catch", "catches", "caught"],
  ["the team", "practise", "practises", "daily", "improve", "improves", "improved"],
  ["Leo", "save", "saves", "enough money", "buy", "buys", "bought"],
  ["we", "take", "take", "the train", "arrive", "arrive", "arrived"],
  ["Nora", "study", "studies", "tonight", "pass", "passes", "passed"],
  ["the shop", "lower", "lowers", "its prices", "attract", "attracts", "attracted"],
  ["students", "sleep", "sleep", "well", "concentrate", "concentrate", "concentrated"],
  ["the weather", "remain", "remains", "dry", "hold", "holds", "held"],
];

const conditionalQuestions = conditionalSituations.flatMap(
  ([subject, verb, present, condition, result, resultPresent, resultPast], index) => [
    {
      sentence: `If ${subject} ___ ${condition}, it normally ${resultPresent}.`,
      answer: present,
      options: rotatedOptions(present, [verb, `will ${verb}`, `had ${verb}`], index),
    },
    {
      sentence: `If ${subject} ___ ${condition}, it will ${result}.`,
      answer: present,
      options: rotatedOptions(present, [verb, `would ${verb}`, `had ${verb}`], index + 1),
    },
    {
      sentence: `If ${subject} ${present} ${condition}, it would ${result}.`,
      answer: condition,
      options: rotatedOptions(condition, ["yesterday", "never", "already"], index + 2),
    },
    {
      sentence: `If ${subject} had ${resultPast} earlier, the situation would have changed.`,
      answer: resultPast,
      options: rotatedOptions(resultPast, [result, resultPresent, `been ${result}`], index + 3),
    },
    {
      sentence: `Unless ${subject} ___ ${condition}, the plan cannot continue.`,
      answer: present,
      options: rotatedOptions(present, [verb, `will ${verb}`, `would ${verb}`], index + 4),
    },
  ],
);

const conditionals = questionQuiz({
  id: "conditionals",
  name: "Conditionals",
  description: "Zero, first, second, third and alternative conditionals",
  icon: "↔️",
  questions: conditionalQuestions,
});

const comparativeWords = [
  ["bright", "brighter", "brightest"], ["calm", "calmer", "calmest"],
  ["cheap", "cheaper", "cheapest"], ["clean", "cleaner", "cleanest"],
  ["cold", "colder", "coldest"], ["dark", "darker", "darkest"],
  ["fast", "faster", "fastest"], ["friendly", "friendlier", "friendliest"],
  ["happy", "happier", "happiest"], ["healthy", "healthier", "healthiest"],
  ["heavy", "heavier", "heaviest"], ["high", "higher", "highest"],
  ["large", "larger", "largest"], ["long", "longer", "longest"],
  ["near", "nearer", "nearest"], ["quiet", "quieter", "quietest"],
  ["safe", "safer", "safest"], ["short", "shorter", "shortest"],
  ["slow", "slower", "slowest"], ["small", "smaller", "smallest"],
  ["strong", "stronger", "strongest"], ["tall", "taller", "tallest"],
  ["warm", "warmer", "warmest"], ["wide", "wider", "widest"],
  ["young", "younger", "youngest"],
];

const comparativeContexts = [
  ["this lamp", "that candle", "light in the room"],
  ["the lake today", "the sea yesterday", "place on the route"],
  ["the online ticket", "the paper ticket", "option available"],
  ["the new engine", "the old engine", "machine in the workshop"],
  ["the mountain lake", "the public pool", "water we tested"],
  ["the blue fabric", "the grey fabric", "material in the collection"],
  ["the express train", "the local bus", "service on this route"],
  ["our new guide", "the previous guide", "person at the centre"],
  ["Maya after the news", "Leo before the result", "student in the group"],
  ["the vegetable dish", "the fried snack", "meal on the menu"],
  ["the wooden box", "the paper bag", "package on the table"],
  ["the northern path", "the coastal road", "route on the map"],
  ["the main gallery", "the side room", "space in the museum"],
  ["the documentary", "the advert", "video in the programme"],
  ["the town library", "the bus station", "building from our school"],
  ["the garden at dawn", "the market at noon", "location we recorded"],
  ["the cycle lane", "the main road", "route into town"],
  ["the introduction", "the final chapter", "section of the book"],
  ["the electric ferry", "the old boat", "vehicle in the harbour"],
  ["the compact camera", "the studio camera", "device in the case"],
  ["the steel bridge", "the wooden bridge", "structure across the river"],
  ["Nora", "her older brother", "player on the team"],
  ["the greenhouse", "the open field", "area in the garden"],
  ["the cinema screen", "the classroom display", "screen in the building"],
  ["the new actor", "the director", "member of the cast"],
];

const comparativeQuestions = comparativeWords.flatMap(
  ([base, comparative, superlative], index) => {
    const [left, right, group] = comparativeContexts[index];
    return [
    {
      sentence: `${left[0].toUpperCase()}${left.slice(1)} is ___ than ${right}.`,
      answer: comparative,
      options: rotatedOptions(comparative, [base, superlative, `more ${comparative}`], index),
    },
    {
      sentence: `That was the ___ ${group}.`,
      answer: superlative,
      options: rotatedOptions(superlative, [base, comparative, `most ${comparative}`], index + 1),
    },
    ];
  },
);

const comparatives = questionQuiz({
  id: "comparatives",
  name: "Comparatives & Superlatives",
  description: "Compare people, places, objects and experiences",
  icon: "⚖️",
  questions: comparativeQuestions,
});

const celebrations = conceptQuiz({
  id: "celebrations",
  name: "Celebrations & Gifts",
  description: "Parties, suggestions, gifts and special occasions",
  icon: "🎁",
  prompt: termPrompt,
  concepts: `
anniversary|the yearly date on which an important event happened
banquet|a formal meal for many guests
birthday|the annual celebration of someone’s birth
bride|a woman on her wedding day
bridesmaid|a woman helping a bride during a wedding
candle|a stick of wax burned for light or decoration
card|a folded message sent for a special occasion
ceremony|a formal event marking an important occasion
champagne|a sparkling wine often used for a toast
confetti|small coloured pieces thrown during a celebration
congratulations|words expressing pleasure at someone’s success
costume party|a party where guests wear special clothes
decoration|an object making a place look festive
engagement|an agreement between two people to marry
farewell party|an event held before someone leaves
festival|a series of public cultural celebrations
fireworks|explosive displays producing coloured light
gift voucher|a card that can be exchanged for goods
guest list|the names of people invited to an event
invitation|a request asking someone to attend
newlyweds|two people who have recently married
party favour|a small gift given to a party guest
reception|a social event following a formal ceremony
retirement party|a celebration for someone finishing their career
speech|formal words delivered to a group
surprise party|a celebration hidden from its main guest
toast|a short speech followed by raising a drink
wedding|a ceremony in which people get married
wrapping paper|decorative paper covering a present
graduation|a ceremony marking completion of studies
housewarming|a celebration held in a new home
reunion|a meeting of people after a long separation
milestone|an important stage in someone’s life
souvenir|an object kept as a reminder of an occasion
bouquet|an arranged bunch of flowers
balloon|an inflatable decoration filled with air or gas
venue|the place where an event is held
catering|the service of providing food for an event
entertainment|music or activities provided for guests
host|the person organising or welcoming guests
guest of honour|the person receiving special attention at an event
registry|a list of gifts a couple would like to receive
keepsake|a small object kept for sentimental reasons
ribbon|a narrow decorative strip used on a present
surprise gift|a present the receiver does not expect
charity gift|a donation made in another person’s name
handmade gift|a present created personally rather than manufactured
thoughtful gift|a present showing careful consideration
occasion|a particular important event or time
celebrant|a person leading a ceremony
`,
});

const fashion = conceptQuiz({
  id: "fashion",
  name: "Fashion & Shopping",
  description: "Clothes, materials, shopping and consumer choices",
  icon: "👗",
  prompt: termPrompt,
  concepts: `
accessory|an extra item worn to complete an outfit
bargain|a product sold at a particularly low price
brand|a company name identifying its products
changing room|a private place where shoppers try on clothes
checkout|the place where a customer pays
cotton|a soft natural fibre from a plant
denim|strong cotton fabric commonly used for jeans
designer|a person who creates clothing styles
discount|a reduction in the usual price
dress code|rules about suitable clothing
fabric|material used for making clothes
fast fashion|cheap clothing produced rapidly for current trends
fitting|the process of checking whether clothing has the right size
formal wear|clothing suitable for an official occasion
garment|a single item of clothing
handbag|a small bag used for personal possessions
label|a piece showing size, care or brand information
leather|material made from animal skin
linen|light fabric made from the flax plant
loose-fitting|describing clothing that does not fit tightly
outfit|a set of clothes worn together
pattern|a repeated decorative design on fabric
receipt|proof that a customer paid for something
refund|money returned after a product is taken back
retailer|a business selling goods directly to customers
sale|a period when products are offered at reduced prices
second-hand|previously owned by another person
silk|a smooth fine fabric produced by insects
size|a measurement category for clothing
sleeve|the part of a garment covering an arm
smart-casual|neat clothing that is not completely formal
sustainable fashion|clothing produced with reduced environmental harm
tight-fitting|describing clothing fitting closely to the body
trend|a style becoming popular at a particular time
uniform|standard clothing worn by members of a group
vintage|clothing representing a high-quality older style
wool|warm fibre obtained from animals such as sheep
zip|a fastening made from two rows of metal or plastic teeth
window display|products arranged behind a shop’s front glass
online shopping|buying goods through the internet
impulse purchase|something bought without previous planning
customer service|help a business provides to buyers
ethical brand|a company following responsible social practices
capsule wardrobe|a small collection of versatile clothing
fashion show|an event where models present new designs
catwalk|the raised platform used by models
tailor|a person making or altering fitted clothes
alteration|a change made to improve how clothing fits
waterproof|describing material that prevents water passing through
breathable|describing fabric allowing air to pass through
`,
});

const environment = conceptQuiz({
  id: "environment",
  name: "The Environment",
  description: "Pollution, green spaces and sustainable choices",
  icon: "🌍",
  prompt: termPrompt,
  concepts: `
air pollution|harmful substances present in the atmosphere
biodiversity|the variety of living species in an area
carbon dioxide|a gas released by burning fossil fuels
carbon footprint|the total emissions caused by an activity or person
climate|the typical weather conditions of a region
climate change|long-term alteration of global weather patterns
compost|decayed organic material used to improve soil
conservation|protection of nature and wildlife
deforestation|large-scale removal of forests
drought|a long period with very little rain
ecosystem|living organisms and their physical environment together
emission|a substance released into the air
endangered species|a type of animal or plant at risk of extinction
energy efficiency|using less energy to achieve the same result
erosion|gradual removal of soil or rock
extinction|the permanent disappearance of a species
flood|water covering normally dry land
fossil fuel|coal, oil or gas formed from ancient organisms
global warming|the long-term rise in Earth’s average temperature
green space|an area of grass, trees or plants in a town
habitat|the natural home of a plant or animal
landfill|a site where waste is buried
litter|rubbish left in a public place
microplastic|a very small piece of plastic pollution
natural resource|a useful material occurring in nature
noise pollution|harmful or disturbing levels of sound
organic waste|material from plants or animals that can decay
ozone layer|atmospheric region protecting Earth from ultraviolet light
pollinator|an animal moving pollen between flowers
public transport|shared travel systems such as buses and trains
recycling|processing waste so it can be used again
renewable energy|power from sources that naturally replace themselves
reusable|describing something designed to be used many times
single-use plastic|plastic intended to be used only once
solar power|energy obtained from sunlight
sustainable|able to continue without exhausting natural resources
toxic waste|discarded material that can poison living things
urban garden|a food-growing or green area within a town
water pollution|harmful substances contaminating water
wildlife reserve|a protected area for wild plants and animals
wind power|energy produced by moving air
zero waste|an approach aiming to send no rubbish to landfill
acid rain|rain made harmful by atmospheric pollution
overfishing|catching fish faster than populations can recover
desertification|productive land becoming dry and barren
food miles|the distance food travels before reaching consumers
heatwave|an extended period of unusually hot weather
rainforest|a dense forest receiving very high rainfall
sea level|the average height of the ocean’s surface
wetland|land permanently or seasonally covered by water
`,
});

const fundraising = conceptQuiz({
  id: "fundraising",
  name: "Fundraising & Events",
  description: "Charity events, campaigns and raising money",
  icon: "🤝",
  prompt: termPrompt,
  concepts: `
beneficiary|a person or group receiving help
campaign|an organised effort to achieve a goal
charity|an organisation helping people or causes
collection box|a container used to gather donations
corporate sponsor|a company financially supporting an event
crowdfunding|raising small amounts from many people online
donation|money or goods given to help
donor|a person who gives money or goods
entry fee|money paid to take part in an event
fundraising target|the total amount a campaign hopes to collect
grant|money officially awarded for a purpose
raffle|a competition using numbered tickets and random prizes
sponsor|a person or business providing financial support
sponsorship form|a document recording promised donations
volunteer|a person working without payment
auction|a sale where people compete by offering higher prices
bake sale|an event selling homemade food for a cause
benefit concert|a musical event raising money
charity run|a sponsored race supporting a cause
donation page|a website where supporters give money
fundraising dinner|a paid meal organised to support a cause
garage sale|a sale of used possessions, often for charity
pledge|a formal promise to give money
prize draw|a competition whose winner is chosen randomly
silent auction|an auction using written rather than spoken bids
awareness|public knowledge of an issue
cause|a social problem or organisation receiving support
community group|local people organised around a shared purpose
expenses|costs paid while organising an activity
fundraiser|a person or event that collects money
goal|the result a campaign aims to achieve
impact|the measurable effect of charitable work
non-profit|an organisation not operating for private profit
outreach|work connecting services with people needing them
proceeds|money remaining after event costs are paid
publicity|public attention given to an event
registration|the process of officially joining an event
supporter|someone who helps a campaign or organisation
ticket sales|money collected by selling event admission
volunteer coordinator|the person organising unpaid helpers
matching donation|a gift equalled by another donor
monthly giving|a regular donation made every month
fundraising total|the complete amount collected
charity partner|an organisation cooperating with a campaign
collection point|a place where donated items are received
emergency appeal|an urgent request for donations
in-kind donation|goods or services given instead of money
promotional poster|a printed notice advertising an event
thank-you letter|a message expressing gratitude to a donor
transparency|clear reporting of how donated money is used
  `,
});

const collocations = conceptQuiz({
  id: "collocations",
  name: "Collocations",
  description: "Natural verb, noun, adjective and adverb combinations",
  icon: "🧩",
  prompt: expressionPrompt,
  concepts: `
break a habit|stop a repeated behaviour
catch someone’s attention|make somebody notice something
come to a conclusion|form a final opinion after thinking
draw a conclusion|decide what evidence means
face a challenge|deal directly with a difficult task
give an impression|cause a particular opinion
have an impact|produce a noticeable effect
make a discovery|find something previously unknown
meet a deadline|finish work by the required time
pay attention|listen or watch carefully
play a role|have a function in a situation
pose a danger|create a possible risk
reach an agreement|successfully decide something together
raise awareness|increase public knowledge of an issue
take responsibility|accept a duty or blame
bright future|a period ahead likely to be successful
common knowledge|information that most people know
deep admiration|a very strong feeling of respect
early days|the beginning period of a process
exclusive rights|permission belonging to only one person
great potential|a strong possibility of future success
harsh criticism|very severe negative judgment
high percentage|a large proportion out of one hundred
major improvement|a significant change for the better
rough idea|an approximate understanding
serious concern|an important reason for worry
strong argument|a convincing reason supporting an opinion
valuable experience|useful knowledge gained through doing something
wide range|a large variety
bitter disagreement|an angry and lasting difference of opinion
heavy rain|a large amount of rain
strong wind|air moving with considerable force
deep sleep|a state of sleeping very soundly
high demand|a strong desire to buy something
close friend|a person you know and trust very well
great success|an extremely positive result
serious problem|a difficulty requiring careful attention
quick response|an answer given with little delay
strong influence|a powerful effect on behaviour or events
heavy traffic|a large number of vehicles on a road
take action|begin doing something to solve a problem
keep a promise|do what you assured someone you would do
lose patience|become unable to wait calmly
save time|avoid spending unnecessary minutes or hours
waste money|spend funds without receiving value
gain experience|develop knowledge through practical activity
hold a meeting|organise a formal group discussion
deliver a speech|speak formally to an audience
conduct research|carry out a careful investigation
solve a problem|find an effective answer to a difficulty
`,
});

const adjectiveCollocations = conceptQuiz({
  id: "adjective-collocations",
  name: "Adjective Collocations",
  description: "Natural adverb and adjective combinations",
  icon: "🧠",
  prompt: expressionPrompt,
  concepts: `
absolutely certain|completely sure
absolutely delighted|extremely pleased
absolutely essential|completely necessary
badly damaged|seriously physically harmed
badly injured|hurt in a serious way
bitterly disappointed|extremely unhappy about a result
blissfully unaware|happily knowing nothing about a problem
closely associated|connected by a strong relationship
closely linked|joined by an important connection
completely different|having no meaningful similarity
deeply concerned|very worried
deeply disappointed|very unhappy about what happened
deeply grateful|feeling strong appreciation
deeply moved|emotionally affected in a strong way
entirely possible|fully capable of happening
extremely difficult|very hard to do
fairly common|happening quite often
fully aware|knowing all the relevant facts
fully prepared|completely ready
highly effective|working extremely well
highly likely|very probable
highly successful|achieving excellent results
incredibly useful|helpful to a surprising degree
perfectly clear|completely easy to understand
reasonably priced|not costing too much
seriously ill|in very poor health
strongly opposed|firmly against something
strongly recommended|advised with great confidence
thoroughly enjoyable|pleasant from beginning to end
totally unacceptable|not permitted in any way
utterly impossible|completely unable to happen
widely available|obtainable in many places
widely believed|accepted as true by many people
widely recognised|known and accepted by many people
vitally important|absolutely necessary
perfectly normal|not unusual in any way
completely satisfied|pleased in every respect
deeply ashamed|feeling very strong embarrassment or guilt
highly competitive|strongly motivated to defeat others
remarkably similar|alike to a surprising degree
particularly useful|especially helpful
increasingly popular|liked by more people over time
painfully obvious|unpleasantly easy to notice
genuinely surprised|truly not expecting what happened
financially independent|not needing another person’s money
environmentally friendly|causing little harm to nature
technically possible|able to be done with existing technology
physically demanding|requiring considerable bodily effort
socially acceptable|approved by most people in society
internationally famous|known by people in many countries
`,
});

const adjectiveSuffixes = conceptQuiz({
  id: "adjective-suffixes",
  name: "Adjective Suffixes",
  description: "Build adjectives with common suffixes",
  icon: "🏷️",
  prompt: wordPrompt,
  concepts: `
acceptable|considered satisfactory or suitable
accessible|easy to enter, reach or use
adventurous|willing to try exciting or risky activities
ambitious|strongly determined to succeed
attractive|pleasant or interesting to look at
careful|giving close attention to avoid mistakes
colourful|containing many bright colours
comfortable|providing physical ease and relaxation
confident|sure of your own ability
convenient|easy to use and suitable for your needs
creative|able to produce original ideas
dangerous|likely to cause harm
effective|producing the intended result
efficient|working well without wasting resources
enjoyable|giving pleasure
environmental|connected with the natural world
famous|known by many people
fashionable|following a currently popular style
flexible|able to bend or adapt easily
generous|willing to give more than expected
harmful|causing damage
helpful|providing useful assistance
historic|important in history
hopeful|feeling positive about the future
imaginative|showing original and creative thought
impressive|causing admiration
independent|not controlled by another person
informative|providing useful facts
memorable|likely to be remembered
natural|existing without human creation
peaceful|calm and free from disturbance
powerful|having great strength or influence
practical|suitable for real use
professional|showing the skill expected in paid work
recognisable|easy to identify
reliable|consistently good and dependable
responsible|showing good judgment and care
reversible|able to be changed back
sleepy|feeling ready to sleep
stormy|having strong winds and rain
successful|achieving the desired result
sustainable|able to continue without exhausting resources
thoughtful|showing care for other people
traditional|following long-established customs
tricky|requiring care or skill
unforgettable|impossible to forget
valuable|worth a great deal or very useful
visible|able to be seen
windy|having a lot of moving air
wonderful|extremely good or enjoyable
`,
});

const confusedWords = conceptQuiz({
  id: "confused-words",
  name: "Easily Confused Words",
  description: "Choose between words with similar forms or meanings",
  icon: "🔀",
  prompt: wordPrompt,
  concepts: `
accept|agree to receive or approve something
except|not including a particular person or thing
advice|a noun meaning a helpful recommendation
advise|a verb meaning to recommend an action
affect|a verb meaning to influence something
effect|a noun meaning the result of a change
borrow|receive something temporarily from its owner
lend|give something temporarily to another person
bring|carry something toward the speaker
take|carry something away from the speaker
complement|make something else seem better or complete
compliment|a polite expression of praise
desert|a dry region with very little rain
dessert|sweet food eaten after a meal
economic|connected with a country’s economy
economical|using money or resources carefully
ensure|make certain that something happens
insure|provide financial protection against loss
farther|at a greater physical distance
further|to a greater degree or additional extent
fewer|a smaller number of countable things
less|a smaller amount of something uncountable
hear|notice a sound with your ears
listen|pay deliberate attention to a sound
historic|important in history
historical|connected generally with the past
lay|put something down in a position
lie|rest in a horizontal position
loose|not firmly fixed or fitting tightly
lose|stop having something
personal|belonging or relating to one individual
personnel|the employees of an organisation
practical|useful and suitable for real situations
practicable|capable of being done successfully
principal|the most important person or thing
principle|a basic rule or belief
quiet|making little or no noise
quite|to a considerable degree
raise|move something to a higher position
rise|move upward without a direct object
remember|keep or bring a fact back to your mind
remind|cause someone else to remember
sensible|showing good judgment
sensitive|easily affected emotionally or physically
stationary|not moving
stationery|paper and other writing materials
than|a word used when making comparisons
then|at that time or next in order
weather|the atmospheric conditions at a time
whether|a word introducing alternatives
`,
});

const greenTechnology = conceptQuiz({
  id: "green-technology",
  name: "Green Technology",
  description: "Sustainable products, energy and eco-friendly inventions",
  icon: "♻️",
  prompt: termPrompt,
  concepts: `
biodegradable|able to break down naturally without lasting pollution
biofuel|fuel produced from recently living material
carbon capture|technology collecting carbon dioxide before release
charging station|a place supplying electricity to a vehicle
clean energy|power produced with little pollution
electric vehicle|a vehicle powered by an electric motor
energy monitor|a device measuring power use
energy-efficient appliance|a machine performing its task with less power
geothermal energy|heat obtained from below Earth’s surface
green building|a structure designed to reduce environmental harm
heat pump|a device transferring heat into or out of a building
home insulation|material reducing heat loss from a house
hydroelectric power|electricity produced by moving water
LED bulb|a low-energy electronic light
rechargeable battery|a power cell designed to be filled with energy again
recycled material|substance recovered from previous waste
smart grid|an electricity network using digital control
smart meter|a device automatically reporting energy consumption
solar panel|a device converting sunlight into useful energy
solar farm|a large site containing many solar panels
tidal power|energy generated by the movement of ocean tides
wind turbine|a machine generating electricity from moving air
zero-emission vehicle|transport producing no exhaust pollution while used
greywater system|technology reusing water from sinks or showers
rainwater harvesting|collecting rain for later use
composting toilet|a toilet treating waste without a sewer system
passive house|a building needing very little heating or cooling
green roof|a building roof covered with living plants
vertical farm|a system growing crops in stacked indoor layers
drip irrigation|watering crops slowly at their roots
precision agriculture|technology applying farm resources only where needed
plant-based plastic|plastic produced partly from renewable plant material
reusable packaging|containers designed for repeated use
water-saving showerhead|a fitting reducing water used while washing
motion sensor|a device activating equipment when movement is detected
programmable thermostat|a controller changing temperature on a schedule
district heating|one central system heating many buildings
electric heat pump|electrical equipment moving rather than creating heat
anaerobic digester|a system turning organic waste into gas
green hydrogen|hydrogen produced using renewable electricity
fuel cell|a device generating electricity through a chemical reaction
thermal storage|technology keeping heat or cold for later
microgrid|a small local electricity network
wave energy|power captured from ocean surface movement
building automation|digital control of lighting, heating and ventilation
low-flow tap|a fitting reducing water flow
repairable design|a product structure allowing damaged parts to be replaced
modular product|an item built from sections that can be changed separately
environmental sensor|a device measuring conditions such as pollution
carbon calculator|a tool estimating greenhouse-gas emissions
  `,
});

const communication = conceptQuiz({
  id: "communication",
  name: "Communication & Culture",
  description: "Messages, emojis, friendship and cultural identity",
  icon: "🌐",
  prompt: termPrompt,
  concepts: `
accent|a particular way of pronouncing a language
body language|communication through physical movement and posture
caption|short text explaining an image
chat|an informal conversation
clarification|an explanation making something easier to understand
comment|a written or spoken opinion
communication barrier|something preventing clear understanding
conversation|informal spoken exchange between people
debate|formal discussion presenting opposing views
dialect|a regional or social form of a language
direct message|a private message sent on a social platform
emoji|a small digital image expressing an idea or emotion
eye contact|looking directly at another person’s eyes
facial expression|a look showing a person’s emotion
feedback|comments intended to help improvement
gesture|a hand or body movement communicating meaning
greeting|words or actions used when meeting someone
intonation|the rise and fall of the voice while speaking
interview|a conversation in which questions are asked
listener|a person paying attention to speech or sound
misunderstanding|a failure to interpret something correctly
notification|an automatic message announcing new activity
podcast|a digital audio programme available online
post|content published on a social platform
presentation|an organised talk given to an audience
pronunciation|the way a word is spoken
public speaking|talking formally to an audience
questionnaire|a written set of questions for collecting information
reply|an answer to a message or question
sign language|communication using hand shapes and movement
speaker|a person addressing others
speech|a formal spoken presentation
status update|a short online message about current activity
subtitle|written dialogue displayed on a screen
tone of voice|the vocal quality showing attitude or emotion
translation|text or speech changed into another language
video call|a live conversation using sound and moving images
voice message|a recorded spoken message
friendship|a close relationship between friends
trust|belief that another person is honest and reliable
custom|a traditional way of behaving
tradition|a belief or practice continued over generations
identity|the qualities defining a person or group
stereotype|an oversimplified fixed idea about a group
etiquette|accepted rules of polite behaviour
multicultural|including people or traditions from several cultures
community|people connected by place or shared interests
generation|people born during a similar period
symbol|an image or object representing an idea
interpretation|a particular understanding of meaning
`,
});

const foodPhrasalVerbs = conceptQuiz({
  id: "food-phrasal-verbs",
  name: "Food Phrasal Verbs",
  description: "Phrasal verbs used for cooking, eating and food",
  icon: "🍳",
  prompt: expressionPrompt,
  concepts: `
boil down|reduce a liquid by heating it
chop up|cut food into small pieces
cool down|become less hot
cut back on|consume less of something
cut out|stop eating a particular food
dig in|begin eating enthusiastically
dish out|serve food onto plates
eat out|have a meal in a restaurant
finish off|eat or use the final part
fry up|cook several foods together in oil
heat up|make food hotter
live on|eat mainly one type of food
mix in|add an ingredient by combining it
pig out|eat an unusually large amount
pick at|eat only small amounts without enthusiasm
polish off|eat all of something quickly
pour in|add a liquid to a mixture
serve up|present food ready to eat
slice up|cut food into thin flat pieces
thaw out|allow frozen food to become unfrozen
warm up|make food pleasantly hot
wash down|drink something after or with food
whip up|prepare food very quickly
wolf down|eat something extremely quickly
use up|consume all that remains
top up|add more to fill a container
take away|buy prepared food to eat elsewhere
stock up on|buy a large supply for future use
spice up|make food more strongly flavoured
soak up|absorb a liquid
separate out|remove one part from a mixture
roll out|flatten dough with a rolling pin
rinse off|clean food quickly with water
pick out|remove selected items from food
mash up|crush food into a soft mass
leave out|not include a particular ingredient
keep down|manage to retain food without vomiting
go off|become no longer fresh enough to eat
give up|stop consuming a food or drink
filter out|remove solid material from a liquid
fill up on|eat enough of something to feel full
cut into|divide food using a knife
crack open|break a shell or sealed container
come with|be served together as part of a dish
blend in|combine an ingredient until it cannot be distinguished
bake in|include an ingredient during baking
add in|put an extra ingredient into a mixture
bring to the boil|heat a liquid until it bubbles
set aside|keep prepared food for use later
throw together|prepare a meal quickly from available ingredients
`,
});

const verbPatterns = conceptQuiz({
  id: "verb-patterns",
  name: "Verb Patterns",
  description: "Verbs followed by infinitives or gerunds",
  icon: "🧱",
  prompt: expressionPrompt,
  concepts: `
agree to help|accept that you will assist
appear to know|seem to have information
arrange to meet|make plans for a meeting
attempt to solve|try to find an answer
choose to leave|decide that you will go
decide to apply|make a choice to submit a request
expect to arrive|believe you will reach a place
fail to notice|not manage to see or realise
happen to find|discover something by chance
hope to visit|want a future visit to happen
learn to drive|develop the skill of controlling a car
manage to finish|succeed in completing something
offer to carry|volunteer to transport something
plan to study|intend to learn in the future
prepare to speak|get ready to address people
pretend to understand|act as if something is clear
promise to return|give assurance that you will come back
refuse to answer|say that you will not respond
seem to work|appear to function
tend to worry|usually become anxious
want to improve|desire to become better
would like to join|politely express a wish to participate
avoid wasting|prevent unnecessary use
consider moving|think about changing where you live
delay making|postpone producing something
deny taking|say that you did not remove something
enjoy learning|take pleasure in gaining knowledge
finish writing|complete the activity of creating text
imagine living|form a mental picture of residing somewhere
involve working|require doing a job or task
keep trying|continue making an effort
mention seeing|say briefly that you observed something
mind waiting|object to remaining until later
miss talking|feel unhappy because a conversation no longer happens
practise speaking|repeatedly exercise oral language
recommend visiting|advise someone to go to a place
risk losing|accept the possibility of no longer having something
suggest taking|propose using or choosing something
admit breaking|acknowledge that you damaged something
appreciate receiving|feel grateful for being given something
can’t help laughing|be unable to stop finding something funny
can’t stand waiting|strongly dislike remaining until later
feel like going|want to leave or visit
give up trying|stop making an effort
look forward to meeting|feel excited about a future encounter
succeed in finding|manage to discover something
apologise for arriving|say sorry for reaching a place
insist on paying|firmly demand to provide the money
object to changing|express opposition to an alteration
think about studying|consider learning a subject
  `,
});

const reportedActions = [
  ["Maya", "she", "paint", "painting", "painted", "a mural", "the arts centre"],
  ["Leo", "he", "check", "checking", "checked", "the schedule", "the station"],
  ["Nora", "she", "write", "writing", "written", "a review", "the library"],
  ["Ben", "he", "take", "taking", "taken", "a photograph", "the gallery"],
  ["Sofia", "she", "study", "studying", "studied", "the chapter", "the classroom"],
  ["Omar", "he", "organise", "organising", "organised", "the event", "the town hall"],
  ["Grace", "she", "design", "designing", "designed", "a poster", "the studio"],
  ["Daniel", "he", "record", "recording", "recorded", "a podcast", "the media room"],
  ["Emma", "she", "prepare", "preparing", "prepared", "a presentation", "the office"],
  ["James", "he", "repair", "repairing", "repaired", "the equipment", "the workshop"],
];

const reportedQuestions = reportedActions.flatMap(
  ([name, pronoun, base, ing, participle, object, place], index) => [
    {
      sentence: `${name} said, “I am ${ing} ${object}.” ${name} said that ${pronoun} ___.`,
      answer: `was ${ing} ${object}`,
      options: rotatedOptions(`was ${ing} ${object}`, [`is ${ing} ${object}`, `had ${participle} ${object}`, `will ${base} ${object}`], index),
    },
    {
      sentence: `The teacher told ${name}, “${base[0].toUpperCase()}${base.slice(1)} ${object}.” The teacher told ${name} ___.`,
      answer: `to ${base} ${object}`,
      options: rotatedOptions(`to ${base} ${object}`, [`${base} ${object}`, `${ing} ${object}`, `that ${base} ${object}`], index + 1),
    },
    {
      sentence: `“Have you ${participle} ${object}?” the teacher asked ${name}. The teacher asked whether ${pronoun} ___.`,
      answer: `had ${participle} ${object}`,
      options: rotatedOptions(`had ${participle} ${object}`, [`has ${participle} ${object}`, `was ${ing} ${object}`, `would ${base} ${object}`], index + 2),
    },
    {
      sentence: `“Where will you ${base} ${object}?” I asked ${name}. I asked where ${pronoun} ___.`,
      answer: `would ${base} ${object}`,
      options: rotatedOptions(`would ${base} ${object}`, [`will ${base} ${object}`, `had ${participle} ${object}`, `was ${ing} ${object}`], index + 3),
    },
    {
      sentence: `“Don’t ${base} ${object} in ${place},” the guide warned ${name}. The guide warned ${name} ___.`,
      answer: `not to ${base} ${object} in ${place}`,
      options: rotatedOptions(`not to ${base} ${object} in ${place}`, [`to not ${base} ${object} in ${place}`, `don’t ${base} ${object} in ${place}`, `not ${base} ${object} in ${place}`], index + 4),
    },
  ],
);

const reportedSpeech = questionQuiz({
  id: "reported-speech",
  name: "Reported Speech",
  description: "Reported statements, questions, requests and commands",
  icon: "💬",
  questions: reportedQuestions,
});

const relativeSubjects = [
  ["artist", "painted the mural", "person"], ["director", "made the documentary", "person"],
  ["scientist", "explained the lights", "person"], ["chef", "created the recipe", "person"],
  ["volunteer", "organised the fundraiser", "person"], ["teacher", "recommended the book", "person"],
  ["photographer", "took the portrait", "person"], ["engineer", "designed the turbine", "person"],
  ["journalist", "wrote the article", "person"], ["guide", "led the tour", "person"],
  ["camera", "records in low light", "thing"], ["device", "measures energy use", "thing"],
  ["film", "won the award", "thing"], ["painting", "hangs near the entrance", "thing"],
  ["bus", "stops outside the museum", "thing"], ["app", "translates messages", "thing"],
  ["material", "absorbs visible light", "thing"], ["book", "contains the photographs", "thing"],
  ["machine", "recycles plastic", "thing"], ["recipe", "uses very little sugar", "thing"],
  ["gallery", "we met the curator", "place"], ["town", "the festival began", "place"],
  ["studio", "the portrait was taken", "place"], ["park", "the charity run finished", "place"],
  ["school", "the club meets", "place"], ["café", "they serve local coffee", "place"],
  ["island", "the birds return each year", "place"], ["theatre", "the film premiered", "place"],
  ["market", "we bought the gift", "place"], ["workshop", "the equipment is stored", "place"],
  ["student", "project won first prize", "owner"], ["artist", "home became a museum", "owner"],
  ["company", "products use recycled plastic", "owner"], ["writer", "story inspired the film", "owner"],
  ["team", "campaign raised the money", "owner"], ["chef", "restaurant won an award", "owner"],
  ["photographer", "camera was stolen", "owner"], ["family", "shop sells handmade gifts", "owner"],
  ["school", "garden attracts bees", "owner"], ["museum", "collection includes the portrait", "owner"],
  ["morning", "the storm arrived", "time"], ["year", "the gallery opened", "time"],
  ["day", "we recorded the podcast", "time"], ["summer", "the festival moved outdoors", "time"],
  ["week", "the team met its target", "time"], ["month", "the exhibition closed", "time"],
  ["moment", "the lights appeared", "time"], ["evening", "the winners were announced", "time"],
  ["period", "the artist lived abroad", "time"], ["season", "the park is busiest", "time"],
];

const relativeQuestions = relativeSubjects.map(([noun, clause, type], index) => {
  const relative = type === "person" ? "who" : type === "thing" ? "which" : type === "place" ? "where" : type === "owner" ? "whose" : "when";
  const answer = type === "owner" ? `whose ${clause}` : `${relative} ${clause}`;
  const endings = [
    "appears in the article",
    "is described in the guidebook",
    "was included in the report",
    "features in the documentary",
    "is part of the exhibition",
    "was discussed during class",
    "is mentioned on the website",
    "appears in the final chapter",
    "was selected for the presentation",
    "is shown on the information board",
  ];
  const ending =
    index === 36 ? "is featured in the school newsletter" : endings[index % endings.length];
  return {
    sentence: `The ${noun} ___ ${ending}.`,
    answer,
    options: rotatedOptions(
      answer,
      [`who ${clause}`, `which ${clause}`, `where ${clause}`, `whose ${clause}`, `when ${clause}`],
      index,
    ),
  };
});

const relativeClauses = questionQuiz({
  id: "relative-clauses",
  name: "Relative Clauses",
  description: "Defining, non-defining and reduced relative clauses",
  icon: "🧷",
  questions: relativeQuestions,
});

const passiveActions = [
  ["produce", "produced", "honey"], ["create", "created", "the first emoji"],
  ["announce", "announced", "the results"], ["display", "displayed", "the sculpture"],
  ["prepare", "prepared", "the costumes"], ["open", "opened", "a new trail"],
  ["give", "given", "protective clothing"], ["serve", "served", "the cheese"],
  ["interpret", "interpreted", "the message"], ["build", "built", "the gallery"],
  ["restore", "restored", "the portrait"], ["record", "recorded", "the interview"],
  ["publish", "published", "the article"], ["organise", "organised", "the festival"],
  ["collect", "collected", "the donations"], ["design", "designed", "the poster"],
  ["repair", "repaired", "the camera"], ["translate", "translated", "the subtitles"],
  ["recycle", "recycled", "the packaging"], ["install", "installed", "the solar panels"],
  ["deliver", "delivered", "the gifts"], ["photograph", "photographed", "the ceremony"],
  ["protect", "protected", "the wetland"], ["measure", "measured", "the emissions"],
  ["review", "reviewed", "the film"], ["select", "selected", "the winner"],
  ["invite", "invited", "the guests"], ["decorate", "decorated", "the hall"],
  ["fund", "funded", "the project"], ["plant", "planted", "the trees"],
  ["broadcast", "broadcast", "the programme"], ["sell", "sold", "the tickets"],
  ["write", "written", "the screenplay"], ["take", "taken", "the photograph"],
  ["choose", "chosen", "the location"], ["make", "made", "the costumes"],
  ["find", "found", "the missing equipment"], ["send", "sent", "the invitations"],
  ["hold", "held", "the meeting"], ["teach", "taught", "the new vocabulary"],
  ["award", "awarded", "the prize"], ["complete", "completed", "the survey"],
  ["reduce", "reduced", "the waste"], ["replace", "replaced", "the old lights"],
  ["clean", "cleaned", "the beach"], ["sponsor", "sponsored", "the charity run"],
  ["exhibit", "exhibited", "the artwork"], ["discover", "discovered", "the cave"],
  ["report", "reported", "the unusual weather"], ["cancel", "cancelled", "the outdoor event"],
];

const passiveQuestions = passiveActions.map(([base, participle, object], index) => {
  const patterns = [
    [`${object[0].toUpperCase()}${object.slice(1)} ___ every year.`, `is ${participle}`],
    [`${object[0].toUpperCase()}${object.slice(1)} ___ yesterday.`, `was ${participle}`],
    [`${object[0].toUpperCase()}${object.slice(1)} ___ by next Friday.`, `will be ${participle}`],
    [`${object[0].toUpperCase()}${object.slice(1)} ___ at the moment.`, `is being ${participle}`],
    [`${object[0].toUpperCase()}${object.slice(1)} has already ___.`, `been ${participle}`],
  ];
  const [sentence, answer] = patterns[index % patterns.length];
  return {
    sentence,
    answer,
    options: rotatedOptions(answer, [base, participle, `has ${participle}`], index),
  };
});

const passiveForms = questionQuiz({
  id: "passive-forms",
  name: "Passive Forms",
  description: "Passive structures across tenses and reporting patterns",
  icon: "🔄",
  questions: passiveQuestions,
});

const modalConcepts = parseConcepts(`
must wear a helmet|a rule makes protective headwear obligatory
could borrow the camera|a polite request asks permission to use equipment
must be at home|available evidence leads to a strong positive deduction
can’t be Leo|known facts make an identity impossible
might visit the exhibition|a future visit is possible but uncertain
mustn’t bring food|a rule prohibits taking food inside
don’t have to submit today|submission today is optional rather than forbidden
should check the weather|checking conditions is sensible advice
may arrive late|a delay is a realistic possibility
would help me|a polite request asks someone for assistance
can speak three languages|someone has a present ability with languages
could swim at five|someone had a general ability in childhood
shouldn’t waste water|advice recommends avoiding unnecessary water use
ought to apologise|the morally appropriate action is saying sorry
have to show identification|an external rule requires proof of identity
needn’t print the form|printing a document is unnecessary
must have forgotten|evidence supports a strong deduction about the past
can’t have seen the message|a past event is logically impossible
might have taken the bus|one possible past explanation involves bus travel
should have called earlier|criticism concerns a call that did not happen
could have won|a past victory was possible but did not happen
would rather stay home|someone prefers remaining at home
had better leave now|strong advice recommends immediate departure
be able to finish|future ability concerns completing a task
may not know the answer|it is possible that someone lacks information
must finish by Friday|a deadline creates a strong obligation
can use the library|permission allows access to a place
could you repeat that|a polite request asks for words again
shall we start|a speaker suggests beginning together
will you close the window|a request asks someone to shut something
would you mind waiting|a very polite request asks for patience
should be arriving soon|an expected arrival is likely in the near future
must be joking|evidence makes humorous intent almost certain
can’t be serious|a statement seems impossible to believe sincerely
might not attend|absence is a possible future outcome
need to recharge the battery|a low battery creates a necessity
mustn’t touch the artwork|a museum rule strictly prohibits contact
don’t need to book|making a reservation is unnecessary
was able to solve it|someone succeeded in one particular past situation
couldn’t understand the accent|someone lacked a past ability to comprehend speech
may I come in|a formal request asks permission to enter
can I ask a question|an informal request asks permission to speak
should take a break|advice recommends resting for a short time
ought not to drive|advice recommends avoiding driving
have got to hurry|the situation creates an urgent necessity
would always visit|a repeated characteristic action happened in the past
used to be able to run|a past ability no longer exists
might be working|an uncertain deduction concerns an action happening now
must have been waiting|evidence supports a deduction about a continuing past action
can’t have been sleeping|evidence makes a continuing past action impossible
`);

const modalQuestions = modalConcepts.map(({ answer, clue }, index) => {
  const otherAnswers = modalConcepts.map((item) => item.answer);
  return {
    sentence: `The modal expression for this situation is ___: ${clue}.`,
    answer,
    options: rotatedOptions(answer, [
      otherAnswers[(index + 9) % 50],
      otherAnswers[(index + 21) % 50],
      otherAnswers[(index + 34) % 50],
    ], index),
  };
});

const modalVerbs = questionQuiz({
  id: "modal-verbs",
  name: "Modal Verbs",
  description: "Ability, permission, advice, obligation and deduction",
  icon: "🚦",
  questions: modalQuestions,
});

export const INITIAL_FOCUSED_QUIZZES = {
  "phrasal-verbs": phrasalVerbs,
  "art-natural-phenomena": artPhenomena,
  film,
  photography,
  "negative-prefixes": negativePrefixes,
  "make-do": makeDo,
  "noun-suffixes": nounSuffixes,
  "compound-words": compoundWords,
  "present-tenses": presentTenses,
  "past-tenses": pastTenses,
  "future-forms": futureForms,
  conditionals,
  comparatives,
  celebrations,
  fashion,
  environment,
  fundraising,
  collocations,
  "adjective-collocations": adjectiveCollocations,
  "adjective-suffixes": adjectiveSuffixes,
  "confused-words": confusedWords,
  "green-technology": greenTechnology,
  communication,
  "food-phrasal-verbs": foodPhrasalVerbs,
  "verb-patterns": verbPatterns,
  "reported-speech": reportedSpeech,
  "relative-clauses": relativeClauses,
  "passive-forms": passiveForms,
  "modal-verbs": modalVerbs,
};
