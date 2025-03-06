import 'survey-core/defaultV2.min.css';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import questionnaireJson from './questionnaireJson';
import HeaderComponent from '../../components/header/HeaderComponent';
import styles from './stylesJson';
import { saveQuestionnaireResults } from '../../api/questionnaireApi';
import { useNavigate } from "react-router-dom";

const Questionnaire = () => {
  const navigate = useNavigate();
  const questionnaire = new Model(questionnaireJson);
  questionnaire.applyTheme(styles);

  questionnaire.completedHtml = ""

  questionnaire.onComplete.add(async (survey, options) => {
    //options.showSaveInProgress();
    const surveyResult = survey.data;

    const defaults = {
      age: 99,
      gender: "99",
      location: 99,
      newsConsumptionFrequency: "99",
    education: "99"
    }

    Object.keys(defaults).forEach(key =>{
      if (surveyResult[key] == undefined || surveyResult[key] == "") {
        surveyResult[key] = defaults[key];
      }
    });

    console.log("survey results: ", surveyResult)

    try {
      await saveQuestionnaireResults(surveyResult);
      //options.showSaveSuccess();
      navigate("/introduction")
    } catch (error) {
      options.showSaveError('Error saving results');
      console.error(error);
    }
  }
)

  return(
  <>
  <HeaderComponent isLoggedIn={true}/>
  <div style={{height: 20}}></div>
  <div style={{height: "100vh", overflowY: "auto"}}>

  <Survey model={questionnaire}/>
  </div>

  </>
  )
}

export default Questionnaire