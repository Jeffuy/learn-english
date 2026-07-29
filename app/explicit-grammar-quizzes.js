function buildExplicitQuiz(id, details, questions) {
  return {
    ...details,
    kind: "focused",
    questions: questions.map((question, index) => ({
      id: `${id}-${String(index + 1).padStart(2, "0")}`,
      conceptId: `${id}:explicit-${String(index + 1).padStart(2, "0")}`,
      hint: "Conditionals",
      ...question,
    })),
  };
}

const conditionalQuestions = [
  { sentence: "If you heat ice, it ___.", answer: "melts", options: ["melts", "will melt", "would melt", "melted"] },
  { sentence: "Plants die if they ___ enough water.", answer: "do not get", options: ["do not get", "will not get", "would not get", "had not got"] },
  { sentence: "When the sun sets, the temperature usually ___.", answer: "falls", options: ["falls", "will fall", "would fall", "has fallen"] },
  { sentence: "If people eat too quickly, they sometimes ___ ill.", answer: "feel", options: ["feel", "will feel", "would feel", "felt"] },
  { sentence: "Metal expands when it ___ hot.", answer: "gets", options: ["gets", "will get", "would get", "got"] },
  { sentence: "If I drink coffee late at night, I ___ badly.", answer: "sleep", options: ["sleep", "will sleep", "would sleep", "slept"] },
  { sentence: "A red warning light appears if the battery ___ low.", answer: "is", options: ["is", "will be", "would be", "were"] },
  { sentence: "If students revise regularly, they ___ more information.", answer: "remember", options: ["remember", "will remember", "would remember", "remembered"] },
  { sentence: "When you mix blue and yellow, you ___ green.", answer: "get", options: ["get", "will get", "would get", "got"] },
  { sentence: "The museum closes early if there ___ very few visitors.", answer: "are", options: ["are", "will be", "would be", "were"] },
  { sentence: "If the weather stays dry tomorrow, we ___ the match outdoors.", answer: "will play", options: ["will play", "play", "would play", "played"] },
  { sentence: "Maya will call us as soon as she ___ at the station.", answer: "arrives", options: ["arrives", "will arrive", "would arrive", "arrived"] },
  { sentence: "If you send the form today, the office ___ it by Friday.", answer: "will receive", options: ["will receive", "receives", "would receive", "received"] },
  { sentence: "We will miss the beginning unless the bus ___ soon.", answer: "comes", options: ["comes", "will come", "would come", "came"] },
  { sentence: "If Leo finishes his homework, he ___ us at the cinema.", answer: "will join", options: ["will join", "joins", "would join", "joined"] },
  { sentence: "I will lend you my camera provided that you ___ careful with it.", answer: "are", options: ["are", "will be", "would be", "were"] },
  { sentence: "If the tickets are still available, I ___ two online.", answer: "will buy", options: ["will buy", "buy", "would buy", "bought"] },
  { sentence: "The teacher will explain the rule again if anyone ___ confused.", answer: "feels", options: ["feels", "will feel", "would feel", "felt"] },
  { sentence: "If we do not leave before six, we ___ in heavy traffic.", answer: "will get stuck", options: ["will get stuck", "get stuck", "would get stuck", "got stuck"] },
  { sentence: "You can borrow the tablet as long as you ___ it before lunch.", answer: "return", options: ["return", "will return", "would return", "returned"] },
  { sentence: "If I lived near the coast, I ___ swimming every morning.", answer: "would go", options: ["would go", "will go", "go", "went"] },
  { sentence: "Nora would understand the film better if it ___ subtitles.", answer: "had", options: ["had", "has", "will have", "would have"] },
  { sentence: "If I were you, I ___ the cheaper train ticket.", answer: "would choose", options: ["would choose", "will choose", "choose", "chose"] },
  { sentence: "The room would look brighter if we ___ the walls white.", answer: "painted", options: ["painted", "paint", "will paint", "had painted"] },
  { sentence: "If Ben spoke French, he ___ for that job in Paris.", answer: "could apply", options: ["could apply", "can apply", "will apply", "applied"] },
  { sentence: "What would you do if you ___ a wallet in the street?", answer: "found", options: ["found", "find", "will find", "had found"] },
  { sentence: "If the city had more cycle lanes, fewer people ___ to work.", answer: "would drive", options: ["would drive", "will drive", "drive", "drove"] },
  { sentence: "I would not wear that jacket unless it ___ much warmer.", answer: "were", options: ["were", "is", "will be", "has been"] },
  { sentence: "If our school offered photography, I ___ the course immediately.", answer: "would take", options: ["would take", "will take", "take", "took"] },
  { sentence: "We could hold the concert outside if the stage ___ covered.", answer: "were", options: ["were", "is", "will be", "had been"] },
  { sentence: "If I had seen your message, I ___ immediately.", answer: "would have replied", options: ["would have replied", "would reply", "will reply", "replied"] },
  { sentence: "The team would have won if the referee ___ that final goal.", answer: "had allowed", options: ["had allowed", "allowed", "would allow", "has allowed"] },
  { sentence: "If we had booked earlier, we ___ cheaper seats.", answer: "could have found", options: ["could have found", "could find", "will find", "found"] },
  { sentence: "Sofia would not have missed the train if she ___ home on time.", answer: "had left", options: ["had left", "left", "would leave", "has left"] },
  { sentence: "If the guide had warned us about the rain, we ___ umbrellas.", answer: "would have brought", options: ["would have brought", "would bring", "brought", "had brought"] },
  { sentence: "The cake would have tasted better if you ___ less salt.", answer: "had used", options: ["had used", "used", "would use", "have used"] },
  { sentence: "If Daniel had charged the battery, the camera ___ during the ceremony.", answer: "would not have stopped", options: ["would not have stopped", "would not stop", "did not stop", "had not stopped"] },
  { sentence: "We might have reached the summit if the storm ___ later.", answer: "had started", options: ["had started", "started", "would start", "has started"] },
  { sentence: "If the museum had advertised the event, more people ___.", answer: "would have attended", options: ["would have attended", "would attend", "attended", "had attended"] },
  { sentence: "Emma could have completed the report if her laptop ___ properly.", answer: "had worked", options: ["had worked", "worked", "would work", "has worked"] },
  { sentence: "Take a jacket in case the weather ___ colder later.", answer: "gets", options: ["gets", "will get", "would get", "got"] },
  { sentence: "Even if the tickets are expensive, we ___ to the exhibition.", answer: "will go", options: ["will go", "would go", "went", "had gone"] },
  { sentence: "Suppose you ___ a year off work; where would you travel?", answer: "had", options: ["had", "have", "will have", "had had"] },
  { sentence: "I will attend the workshop on condition that my manager ___ permission.", answer: "gives me", options: ["gives me", "will give me", "would give me", "gave me"] },
  { sentence: "But for your directions, we ___ the theatre.", answer: "would not have found", options: ["would not have found", "will not find", "did not find", "had not found"] },
  { sentence: "If Leo had accepted the internship, he ___ in Berlin now.", answer: "would be living", options: ["would be living", "will be living", "lived", "had lived"] },
  { sentence: "If I were more organised, I ___ the deadline yesterday.", answer: "would not have missed", options: ["would not have missed", "will not miss", "did not miss", "had not missed"] },
  { sentence: "Had the alarm worked, everyone ___ the building sooner.", answer: "would have left", options: ["would have left", "will leave", "left", "had left"] },
  { sentence: "Were the gallery free to enter, more families ___ it.", answer: "would visit", options: ["would visit", "will visit", "visited", "had visited"] },
  { sentence: "Should you need any help, ___ the reception desk.", answer: "contact", options: ["contact", "will contact", "would contact", "contacted"] },
];

const conditionals = buildExplicitQuiz(
  "conditionals",
  {
    name: "Conditionals",
    description: "Zero, first, second, third and alternative conditionals",
    icon: "↔️",
  },
  conditionalQuestions,
);

export const EXPLICIT_GRAMMAR_QUIZZES = {
  conditionals,
};
