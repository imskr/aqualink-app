import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  withStyles,
  WithStyles,
  createStyles,
  Theme,
} from "@material-ui/core";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { maxBy } from "lodash";

import Chart from "./Chart";
import TempAnalysis from "./TempAnalysis";
import {
  reefHoboDataRangeSelector,
  reefHoboDataRequest,
  reefHoboDataSelector,
  reefSpotterDataRequest,
  reefSpotterDataSelector,
} from "../../../../store/Reefs/selectedReefSlice";
import { Metrics, Reef } from "../../../../store/Reefs/types";
import {
  findMarginalDate,
  setTimeZone,
  subtractFromDate,
} from "../../../../helpers/dates";
import {
  filterDailyData,
  filterHoboData,
} from "../../../../common/Chart/utils";

const ChartWithCard = ({ reef, pointId, classes }: ChartWithCardProps) => {
  const dispatch = useDispatch();
  const spotterData = useSelector(reefSpotterDataSelector);
  const { bottomTemperature: hoboBottomTemperature } =
    useSelector(reefHoboDataSelector) || {};
  const { bottomTemperature: hoboBottomTemperatureRange } =
    useSelector(reefHoboDataRangeSelector) || {};
  const hasSpotterData = Boolean(reef.liveData.surfaceTemperature);
  const [pickerEndDate, setPickerEndDate] = useState<string>();
  const [pickerStartDate, setPickerStartDate] = useState<string>();
  const [endDate, setEndDate] = useState<string>();
  const [startDate, setStartDate] = useState<string>();
  const [pastLimit, setPastLimit] = useState<string>();

  const today = new Date(moment().format("MM/DD/YYYY")).toISOString();

  // Set pickers dates
  useEffect(() => {
    if (hoboBottomTemperatureRange && hoboBottomTemperatureRange.length > 0) {
      const { minDate, maxDate } = hoboBottomTemperatureRange[0];
      const pastThreeMonths = subtractFromDate(maxDate, "month", 3);
      const start =
        maxBy([minDate, pastThreeMonths], (date) => new Date(date).getTime()) ||
        minDate;
      setPickerEndDate(
        new Date(moment(maxDate).format("MM/DD/YYYY")).toISOString()
      );
      setPickerStartDate(
        new Date(moment(start).format("MM/DD/YYYY")).toISOString()
      );
      setPastLimit(new Date(moment(start).format("MM/DD/YYYY")).toISOString());
    } else {
      setPickerEndDate(today);
      setPickerStartDate(subtractFromDate(today, "week"));
    }
  }, [hoboBottomTemperatureRange, today]);

  // Get spotter data
  useEffect(() => {
    if (pickerStartDate && pickerEndDate) {
      const reefLocalStartDate = setTimeZone(
        new Date(pickerStartDate),
        reef.timezone
      ) as string;

      const reefLocalEndDate = setTimeZone(
        new Date(pickerEndDate),
        reef.timezone
      ) as string;

      if (hasSpotterData) {
        dispatch(
          reefSpotterDataRequest({
            id: `${reef.id}`,
            startDate: reefLocalStartDate,
            endDate: reefLocalEndDate,
          })
        );
      }
    }
  }, [
    dispatch,
    hasSpotterData,
    pickerEndDate,
    pickerStartDate,
    reef.id,
    reef.timezone,
  ]);

  // Fetch HOBO data if picker start date is before the current past limit
  useEffect(() => {
    if (pickerStartDate && pickerEndDate && pastLimit) {
      const reefLocalStartDate = setTimeZone(
        new Date(pickerStartDate),
        reef.timezone
      ) as string;
      const reefLocalEndDate = setTimeZone(
        new Date(pickerEndDate),
        reef.timezone
      ) as string;

      if (new Date(pickerStartDate).getTime() < new Date(pastLimit).getTime()) {
        setPastLimit(pickerStartDate);
        dispatch(
          reefHoboDataRequest({
            reefId: `${reef.id}`,
            pointId,
            start: reefLocalStartDate,
            end: reefLocalEndDate,
            metrics: [Metrics.bottomTemperature],
          })
        );
      }
    }
  }, [
    dispatch,
    pastLimit,
    pickerEndDate,
    pickerStartDate,
    pointId,
    reef.id,
    reef.timezone,
  ]);

  // Set chart start/end dates
  useEffect(() => {
    const filteredDailyData = filterDailyData(
      reef.dailyData,
      pickerStartDate,
      pickerEndDate
    );
    const filteredHoboData = filterHoboData(
      hoboBottomTemperature || [],
      pickerStartDate,
      pickerEndDate
    );
    if (
      filteredDailyData.length > 0 ||
      (spotterData && spotterData.bottomTemperature.length > 0) ||
      filteredHoboData.length > 0
    ) {
      const maxDataDate = new Date(
        findMarginalDate(filteredDailyData, spotterData, filteredHoboData)
      );
      const minDataDate = new Date(
        findMarginalDate(
          filteredDailyData,
          spotterData,
          filteredHoboData,
          "min"
        )
      );
      const reefLocalEndDate = new Date(
        setTimeZone(
          new Date(moment(pickerEndDate).format("MM/DD/YYYY")),
          reef?.timezone
        ) as string
      );
      const reefLocalStartDate = new Date(
        setTimeZone(
          new Date(moment(pickerStartDate).format("MM/DD/YYYY")),
          reef?.timezone
        ) as string
      );

      if (maxDataDate.getTime() > reefLocalEndDate.getTime()) {
        setEndDate(reefLocalEndDate.toISOString());
      } else {
        setEndDate(maxDataDate.toISOString());
      }

      if (minDataDate.getTime() > reefLocalStartDate.getTime()) {
        setStartDate(minDataDate.toISOString());
      } else {
        setStartDate(reefLocalStartDate.toISOString());
      }
    } else {
      setStartDate(undefined);
      setEndDate(undefined);
    }
  }, [
    hoboBottomTemperature,
    pickerEndDate,
    pickerStartDate,
    reef,
    spotterData,
  ]);

  return (
    <Container>
      <Grid className={classes.chartWrapper} container item spacing={2}>
        <Grid item xs={12} md={9}>
          <Chart
            reef={reef}
            pointId={parseInt(pointId, 10)}
            spotterData={spotterData}
            hoboBottomTemperature={filterHoboData(
              hoboBottomTemperature || [],
              startDate || pickerStartDate,
              endDate || pickerEndDate
            )}
            pickerStartDate={pickerStartDate || today}
            pickerEndDate={pickerEndDate || today}
            startDate={startDate || pickerStartDate || today}
            endDate={endDate || pickerEndDate || today}
            onStartDateChange={(date) =>
              setPickerStartDate(
                new Date(moment(date).format("MM/DD/YYYY")).toISOString()
              )
            }
            onEndDateChange={(date) =>
              setPickerEndDate(
                new Date(moment(date).format("MM/DD/YYYY")).toISOString()
              )
            }
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <Grid container justify="center">
            <Grid item xs={11} sm={5} md={11} lg={10}>
              <TempAnalysis
                startDate={pickerStartDate || today}
                endDate={pickerEndDate || today}
                depth={reef.depth}
                spotterData={spotterData}
                dailyData={reef.dailyData}
                hoboBottomTemperature={filterHoboData(
                  hoboBottomTemperature || [],
                  startDate || pickerStartDate,
                  endDate || pickerEndDate
                )}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    chartWrapper: {
      margin: "80px 0 20px 0",
      [theme.breakpoints.down("xs")]: {
        margin: "40px 0 10px 0",
      },
    },
  });

interface ChartWithCardIncomingProps {
  reef: Reef;
  pointId: string;
}

type ChartWithCardProps = ChartWithCardIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(ChartWithCard);
