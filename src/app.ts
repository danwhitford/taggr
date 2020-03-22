import { Tag } from "en-pos";
import { Lexed } from "lexed";
import { zip, flatMap } from "lodash";
import express from "express";
import BodyParser from "body-parser"
import cors from 'cors'

enum SimplePos {
  Verb = "Vrb",
  Adjective = "Adj",
  Noun = "Nn",
  Adverb = "Avb",
  Pronoun = "Pnn",
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
  } else {
    return SimplePos.Other;
  }
};

const tag = (words: string) => {
  const tokens = new Lexed(words).lexer().tokens;
  const tagObj = new Tag(flatMap(tokens)).initial().smooth();
  return zip(tagObj.tokens, tagObj.tags);
};

const simpleTag = (words: string): [string, SimplePos][] =>
  tag(words).map(tp => {
    return <[string, SimplePos]>[tp[0], simplify(tp[1])];
  });

const app = express()
const port = 8081

app.use(BodyParser.json())
app.use(cors())

app.post('/', (req, res) => {
  const words = req.body.words;
  if (words) {
    return res.json(tag(words))
  } else {
    res.statusCode = 400
    res.send('Invalid request')
  }
})

app.post('/simple', (req, res) => {
  const words = req.body.words;
  if (words) {
    return res.json(simpleTag(words))
  } else {
    res.statusCode = 400
    res.send('Invalid request')
  }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
