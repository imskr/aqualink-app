import React from "react";
import {
  Box,
  createStyles,
  Typography,
  withStyles,
  WithStyles,
} from "@material-ui/core";

import ChartWithTooltip from "./ChartWithTooltip";
import MultipleSensorsCharts from "./MultipleSensorsCharts";
import { Site } from "../../store/Sites/types";
import {
  convertDailyDataToLocalTime,
  convertSurveyDataToLocalTime,
} from "../../helpers/dates";
import { SurveyListItem } from "../../store/Survey/types";

const CombinedCharts = ({
  site,
  closestSurveyPointId,
  surveys,
  classes,
}: CombinedChartsProps) => {
  const { id, timezone, dailyData, depth, maxMonthlyMean } = site;
  return (
    <div>
      <Box className={classes.graphtTitleWrapper}>
        <Typography className={classes.graphTitle} variant="h6">
          HEAT STRESS ANALYSIS (°C)
        </Typography>
      </Box>
      <ChartWithTooltip
        siteId={id}
        depth={depth}
        dailyData={convertDailyDataToLocalTime(dailyData, timezone)}
        surveys={convertSurveyDataToLocalTime(surveys, timezone)}
        temperatureThreshold={maxMonthlyMean ? maxMonthlyMean + 1 : null}
        maxMonthlyMean={maxMonthlyMean || null}
        background
        className={classes.chart}
        timeZone={timezone}
      />
      <MultipleSensorsCharts
        site={site}
        pointId={closestSurveyPointId}
        surveysFiltered={false}
        disableGutters
      />
    </div>
  );
};

const styles = () =>
  createStyles({
    chart: {
      height: "16rem",
      marginBottom: "3rem",
      marginTop: "1rem",
    },
    graphtTitleWrapper: {
      marginLeft: 42,
    },
    graphTitle: {
      lineHeight: 1.5,
    },
  });

interface CombinedChartsIncomingProps {
  site: Site;
  closestSurveyPointId: string | undefined;
  surveys: SurveyListItem[];
}

type CombinedChartsProps = CombinedChartsIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(CombinedCharts);
