import React, { Fragment } from 'react';
import Plot from 'react-plotly.js';
// import Plotly from 'plotly.js/dist/plotly';

export default function Plt(props) {
  return (
    <Fragment>
      <Plot
        data={props.data}
        style={{ width: "100%", height: "100%" }}
        useResizeHandler={true}
        // config={{ displayModeBar: false }}
        layout={{
          // plot_bgcolor: "rgb(20,22,25)",  // 30, 31, 36
          // paper_bgcolor: "rgb(20,22,25)",
          // font: {
          //   color: "rgb(201,208,216)"
          // },
          autosize: true,
          // title: {
          //   text: props.title,
          //   font: {
          //     size: 13,
          //   },
          // },
          margin: {
            l: 30,
            r: 5,
            b: 30,
            t: 5,  // 10
            pad: 4
          },
          height: props.height,
          width: props.width,
          barmode: 'stack',
          legend: {
            orientation: 'h',
            traceorder: 'normal',
          },
          showlegend: true,
          // dragmode: 'lasso', // (enumerated: "zoom" | "pan" | "select" | "lasso" | "orbit" | "turntable" )
          hovermode: 'closest',
          xaxis: {
            showgrid: true,
            // fixedrange: true,
            zeroline: false,
            // type: 'auto',
            // gridcolor: 'rgb(60,61,64)',
            rangemode: 'normal', // (enumerated: "normal" | "tozero" | "nonnegative" )
          },
          yaxis: {
            showgrid: true,
            // fixedrange: true,
            zeroline: false,
            // type: 'linear',
            // gridcolor: 'rgb(60,61,64)',
            rangemode: 'normal', // (enumerated: "normal" | "tozero" | "nonnegative" ),
          },
          zaxis: {
            showgrid: true,
            // fixedrange: true,
            zeroline: false,
            // type: 'linear',
            // gridcolor: 'rgb(60,61,64)',
            rangemode: 'normal', // (enumerated: "normal" | "tozero" | "nonnegative" )
          },
          ...props.layout,
        }}
      />
    </Fragment>
  )
}

Plt.defaultProps = {
  height: 400,
  width: 800,
  title: 'Chart'
}
