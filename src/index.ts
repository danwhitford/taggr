import { Tag } from "en-pos";
import { Lexed } from "lexed";
import { zip, flatMap } from "lodash";
import { APIGatewayEvent } from "aws-lambda";

enum SimplePos {
  Verb = "Vrb",
  Adjective = "Adj",
  Noun = "Nn",
  Adverb = "Avb",
  Pronoun = "Pnn",
  Preposition = "Ppn",
  Conjunctives = "Cjs",
  Determiner = "Dtr",
  Other = "Ukn"
}

const simplify = (tag?: string) => {
  if (tag?.startsWith("NN")) {
    return SimplePos.Noun;
  } else if (tag?.startsWith("JJ")) {
    return SimplePos.Adjective;
  } else if (tag?.startsWith("VB")) {
    return SimplePos.Verb;
  } else if (tag?.startsWith("RB")) {
    return SimplePos.Adverb;
  } else if (tag?.startsWith("PR")) {
    return SimplePos.Pronoun;
  } else if (tag?.startsWith("IN")) {
    return SimplePos.Preposition
  } else if (tag?.startsWith("CC")) {
    return SimplePos.Conjunctives
  } else if (tag?.endsWith("DT")) {
    return SimplePos.Determiner
  } else {
    return SimplePos.Other;
  }
};

const tag = (words: string): [string?, string?][] => {
  const tokens = new Lexed(words).lexer().tokens;
  const tagObj = new Tag(flatMap(tokens)).initial().smooth();
  return zip(tagObj.tokens, tagObj.tags);
};

const simpleTag = (words: string): [string, SimplePos][] =>
  tag(words).map(tp => {
    return <[string, SimplePos]>[tp[0], simplify(tp[1])];
  });

exports.handler =  async function(event: APIGatewayEvent): Promise<any> {
    if (event.body) {
        const body = JSON.parse(event.body)        
        return JSON.stringify(simpleTag(body.words))
    } else {
        return JSON.stringify([])
    }
}
