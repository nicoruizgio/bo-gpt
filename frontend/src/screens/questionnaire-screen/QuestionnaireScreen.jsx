import 'survey-core/defaultV2.min.css';
import {PlainDarkPanelless} from "survey-core/themes";
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import questionnaireJson from './questionnaireJson';
import HeaderComponent from '../../components/HeaderComponent';
import styles from './stylesJson';

const Questionnaire = () => {
  const questionnaire = new Model(questionnaireJson);
  questionnaire.applyTheme(styles);

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