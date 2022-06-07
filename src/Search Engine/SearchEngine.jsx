import React, { useState, useEffect } from "react";
import './SearchEngine.css';
import { Row, Input } from 'antd';
import SentencesFile from '../Sentences';

export function SearchEngine() {
    const [searchText, setSearchText] = useState('');
    const [sentences, setSentences] = useState([]);

    const { Search } = Input;

    useEffect(() => {
        fetch(SentencesFile)
        .then(t => t.text())
        .then(text => text.split("\r\n"))
        .then(sentences => {
            let sentencesWithScore = [];
            for (const sentence of sentences) {
                sentencesWithScore.push([sentence, Math.random()]);
            }
            setSentences(sentencesWithScore);
        });
    }, []);


    const sortByRelevency = () => {
        let sentencesTemp = sentences.slice();
        let longestSentence = 0;
        let largestDifference = 0;
        for (const sentence of sentencesTemp) {
            let difference = Math.abs(sentence[0].length - searchText.length);
            if (difference > largestDifference) largestDifference = difference;
            if (sentence[0].length > longestSentence) longestSentence = sentence[0].length;
        }

        for (const sentence of sentencesTemp) {

            const wordCharacters = searchText.slice().replaceAll(' ', '').length;
            const searchWords = searchText.split(' ');
            let searchTermDivider = 0;
            for (const word of searchWords) {
              searchTermDivider += Math.pow(word.length, 2);
            }
            let str2NoPunctuation = sentence[0].replaceAll('.', '').replaceAll('!', '').replaceAll('?', '');
            let titleWords = str2NoPunctuation.split(' ');
    
            let matchingWordsTotalLengths = 0;
            for (const word of searchWords) {
              for (let i = 0; i < titleWords.length; i++) {
                const levDist = levenshteinDistance(word, titleWords[i]);
                if (levDist / word.length <= .20) {
                  titleWords.splice(i, 1);
                  matchingWordsTotalLengths += Math.pow(word.length - levDist, 2);
                  i = Infinity;
                }
              }
            }
    
            const matchingWordsPercentage = .75;
            const matchingWordsScore = matchingWordsPercentage * (matchingWordsTotalLengths / searchTermDivider) * searchText.length * matchingWordsPercentage;
    
            const multiplier = largestDifference - (Math.abs(searchText.length - sentence[0].length)) - (longestSentence - searchText.length) - matchingWordsScore;

            const score = levenshteinDistance(searchText, sentence[0]) + multiplier;
            sentence[1] = score;
        }
        sentencesTemp.sort((a, b) => a[1] - b[1]);


        // let longestSentence = 0;
        // let largestDifference = 0;
        // for (let sentence of sentencesTemp) {
        //     // sentence[0] = sentence[0].slice().replaceAll(' ', '').replaceAll('.', '').replaceAll('!', '').replaceAll('?', '').replaceAll(',', '');
        //     const sentenceLength = sentence[0].slice().replaceAll(' ', '').replaceAll('.', '').replaceAll('!', '').replaceAll('?', '').replaceAll(',', '').length;
        //     const searchLength = searchText.slice().replaceAll('.', '').replaceAll('!', '').replaceAll('?', '').replaceAll(',', '').length;
        //     let difference = Math.abs(sentenceLength - searchLength);
        //     if (difference > largestDifference) largestDifference = difference;
        //     if (sentence[0].length > longestSentence) longestSentence = sentence[0].length;
        // }
        // console.log(largestDifference, longestSentence)

        // const wordsInSearch = searchText.slice().replaceAll('.', '').replaceAll('!', '').replaceAll('?', '').replaceAll(',', '').toLowerCase().split(' ');
        // for (let item of sentencesTemp) {
        //   const titleWithoutPunctuation = item[0].slice().replaceAll('.', '').replaceAll('!', '').replaceAll('?', '').toLowerCase();
        //   const wordsInTitle = titleWithoutPunctuation.split(' ');
          
        //   // Get all combinations
        //   const charactersOffList = [];
        //   for (const searchWord of wordsInSearch) {
        //     for (const titleWord of wordsInTitle) {
        //       charactersOffList.push(new LevDistSearchTitle(levenshteinDistance(searchWord, titleWord), searchWord, titleWord));
        //     } 
        //   }
        //   charactersOffList.sort((a, b) => b.charactersOff - a.charactersOff);

        //   const remainingTitleWords = {};
        //   const remainingSearchWords = {};

        //   // Populate hashtables
        //   for (const word of wordsInSearch) {
        //     if (remainingSearchWords[word]) {
        //       remainingSearchWords[word]++;
        //     } else {
        //       remainingSearchWords[word] = 1;
        //     }       
        //   }
        //   for (const word of wordsInTitle) {
        //     if (remainingTitleWords[word]) {
        //       remainingTitleWords[word]++;
        //     } else {
        //       remainingTitleWords[word] = 1;
        //     }  
        //   }

        //   const pairs = [];
        //   let totalCharactersOff = 0;
        //   while (pairs.length < wordsInTitle.length && pairs.length < wordsInSearch.length) {
        //     const smallestPair = charactersOffList.pop();
        //     // If both words are not taken yet
        //     if (remainingSearchWords[smallestPair.searchWord] > 0 && remainingTitleWords[smallestPair.titleWord] > 0) {
        //       pairs.push(smallestPair);
        //       totalCharactersOff += smallestPair.charactersOff;
        //       remainingSearchWords[smallestPair.searchWord]--;
        //       remainingTitleWords[smallestPair.titleWord]--;
        //     }
        //   }
        //   for (const word in remainingTitleWords) {
        //     for (let i = 0; i < remainingTitleWords[word]; i++) totalCharactersOff += word.length;
        //   }
        //   for (const word in remainingSearchWords) {
        //     for (let i = 0; i < remainingSearchWords[word]; i++) totalCharactersOff += word.length;
        //   }
        //   const modifiedSearchTextLength = searchText.slice().replaceAll(' ', '').replaceAll('.', '').replaceAll('!', '').replaceAll('?', '').replaceAll(',', '').length;
        //   const modifiedTitleLength = item[0].slice().replaceAll(' ', '').replaceAll('.', '').replaceAll('!', '').replaceAll('?', '').replaceAll(',', '').length;
        //   // const multiplier = largestDifference - (Math.abs(searchText.length - sentence[0].length)) - (longestSentence - searchText.length)
        //   const weight = largestDifference - Math.abs(modifiedSearchTextLength - modifiedTitleLength) - (longestSentence - modifiedSearchTextLength);
        //   // console.log(totalCharactersOff + weight);
        //   // console.log(largestDifference, Math.abs(modifiedSearchTextLength - modifiedTitleLength), longestSentence - modifiedSearchTextLength)
        //   item[1] = totalCharactersOff + weight;
        // }
        
        // sentencesTemp.sort((a, b) => a[1] - b[1]);

        console.log(sentencesTemp);
        setSentences(sentencesTemp);
    }

    const tile = (idx, sentence) => {
        return (
            <div className="tile" id={idx}>
            {sentence[0]}
        </div>
        );
    }

    const levenshteinDistance = (str1, str2) => {
        str1 = " " + str1;
        str2 = " " + str2;
        str1 = str1.toLowerCase();
        str2 = str2.toLowerCase();
        const row = Array(str1.length).fill(0);
        let table = [];
        for (let i = 0; i < str2.length; i++) {
          table.push(row.slice());
        }
        for (let i = 0; i < row.length; i++) {
          table[0][i] = i;
        }
        for (let i = 0; i < table.length; i++) {
          table[i][0] = i;
        }
        for (let i = 1; i < table.length; i++) {
          for (let j = 1; j < row.length; j++) {
            if (str1[j] === str2[i]) {
              table[i][j] = table[i - 1][j - 1];
            } else {
              table[i][j] = Math.min(table[i - 1][j - 1], table[i - 1][j], table[i][j - 1]) + 1;
            }
          }
        }
        return table[table.length - 1][row.length - 1];
      }

    return(
        <>
        <Search 
                className="search-bar"
                placeholder="Search"
                value={searchText}
                onSearch={(e) => {sortByRelevency()}}
                onChange={(e) => {setSearchText(e.target.value)}}
        />
        <Row gutter={[0, 32]}>
            {sentences.map((idx, sentence) => (
                tile(sentence, idx)
            ))}
        </Row>
        </>
    );
}

function LevDistSearchTitle(cOff, sWord, tWord) {
  this.charactersOff = cOff;
  this.searchWord = sWord;
  this.titleWord = tWord;
}