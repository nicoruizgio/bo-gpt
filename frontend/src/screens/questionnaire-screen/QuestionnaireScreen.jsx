import 'survey-core/defaultV2.min.css';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import questionnaireJson from './questionnaireJson';
import HeaderComponent from '../../components/HeaderComponent';
import styles from './stylesJson';
import { saveQuestionnaireResults } from '../../api/questionnaireApi';
import { useNavigate } from "react-router-dom";

const Questionnaire = () => {
  const navigate = useNavigate();
  const questionnaire = new Model(questionnaireJson);
  questionnaire.applyTheme(styles);

  questionnaire.onComplete.add(async (survey, options) => {
    options.showSaveInProgress();
    const surveyResult = survey.data;
    console.log("survey results: ", surveyResult)

    try {
      await saveQuestionnaireResults(surveyResult);
      options.showSaveSuccess();
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