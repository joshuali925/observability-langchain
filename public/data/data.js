const randfloat = (min, max) => Math.random() * (max - min) + min;

const length = 20;
const x = Array.from({ length: length }, (v, i) => i);
const responseTimeWeb = Array.from({ length: length }, () => randfloat(10, 25));
const responseTimeRedis = Array.from({ length: length }, () => randfloat(15, 20));
const responseTimeJVM = Array.from({ length: length }, () => randfloat(15, 30));
const responseTime = Array.from({ length: length }, (v, i) => responseTimeJVM[i] + responseTimeRedis[i] + responseTimeWeb[i]);
export const datalist = { responseTime, responseTimeWeb, responseTimeRedis, responseTimeJVM };

export const layout = {
  yaxis: { range: [0, Math.max(...responseTime) * 1.3] },
};

export const sampleLogData = (selectedFields) => {
  const data = {
    data: [
      {
        x: x,
        y: responseTimeWeb,
        line: {
          color: 'rgb(211, 95, 133)',
          width: 1,
          dash: 'solid',
          shape: 'linear',
        },
        fillcolor: 'rgb(211, 95, 133)',
        type: 'scatter',
        name: 'ResponseTimeWeb',
        mode: 'none',
        fill: 'tonexty',  // tozeroy
      },
      {
        x: x,
        y: Array.from({ length: length }, (v, i) => responseTimeWeb[i] + responseTimeRedis[i]),
        line: {
          color: 'rgb(85, 178, 153)',
          width: 1,
          dash: 'solid',
          shape: 'linear',
        },
        fillcolor: 'rgb(85, 178, 153)',
        type: 'scatter',
        name: 'ResponseTimeRedis',
        mode: 'none',
        fill: 'tonexty',  // tozeroy
      },
      {
        x: x,
        y: responseTime,
        line: {
          color: 'rgb(93, 141, 188)',
          width: 1,
          dash: 'solid',
          shape: 'linear',
        },
        fillcolor: 'rgb(93, 141, 188)',
        type: 'scatter',
        name: 'ResponseTimeJVM',
        mode: 'none',
        fill: 'tonexty',  // tozeroy
      },
      {
        x: x,
        y: responseTime,
        line: {
          color: 'black',
          width: 2,
          dash: 'solid',
          shape: 'linear',
        },
        type: 'scatter',
        name: 'ResponseTime',
      },
    ],
    title: 'Response Time'
  };
  
  // selectedFields.forEach(field => {
  //   let y = datalist[field.name];
  //   if (data.data.length > 0 && data.data[data.data.length - 1].fill === 'tonexty' && field.type !== 'line') {
  //     let prevY = data.data[data.data.length - 1].y;
  //     y = Array.from({ length: y.length }, (v, i) => y[i] + prevY[i]);
  //   }
  //   let trace = null;
  //   if (field.type === 'area') {
  //     trace = {
  //       x: x,
  //       y: y,
  //       line: {
  //         color: field.color,
  //         width: 1,
  //         dash: 'solid',
  //         shape: 'linear',
  //       },
  //       fillcolor: field.color,
  //       type: 'scatter',
  //       name: field.name,
  //       mode: 'none',
  //       fill: 'tonexty',  // tozeroy
  //     }
  //   } else if (field.type === 'line') {
  //     trace = {
  //       x: x,
  //       y: y,
  //       line: {
  //         color: field.color,
  //         width: 2,
  //         dash: 'solid',
  //         shape: 'linear',
  //       },
  //       type: 'scatter',
  //       name: field.name,
  //     }
  //   }
  //   data.data.push(trace);
  // });
  return data;
}

export const metadata = [
  {
    name: 'responseTime',
    icon: 'tokenNumber',
    type: 'line',
    color: 'black',
    length: length,
    uniqueEntries: new Set(responseTime).size,
    valueRange: `${Math.min(...responseTime).toFixed(1)}ms-${Math.max(...responseTime).toFixed(1)}ms`,
    average: `${(responseTime.reduce((a, b) => a + b, 0) / responseTime.length).toFixed(1)}ms`
  },
  {
    name: 'responseTimeWeb',
    icon: 'tokenNumber',
    type: 'area',
    color: 'rgb(211, 95, 133)',
    length: length,
    uniqueEntries: new Set(responseTimeWeb).size,
    valueRange: `${Math.min(...responseTimeWeb).toFixed(1)}ms-${Math.max(...responseTimeWeb).toFixed(1)}ms`,
    average: `${(responseTimeWeb.reduce((a, b) => a + b, 0) / responseTimeWeb.length).toFixed(1)}ms`
  },
  {
    name: 'responseTimeRedis',
    icon: 'tokenNumber',
    type: 'area',
    color: 'rgb(85, 178, 153)',
    length: length,
    uniqueEntries: new Set(responseTimeRedis).size,
    valueRange: `${Math.min(...responseTimeRedis).toFixed(1)}ms-${Math.max(...responseTimeRedis).toFixed(1)}ms`,
    average: `${(responseTimeRedis.reduce((a, b) => a + b, 0) / responseTimeRedis.length).toFixed(1)}ms`
  },
  {
    name: 'responseTimeJVM',
    icon: 'tokenNumber',
    type: 'area',
    color: 'rgb(93, 141, 188)',
    length: length,
    uniqueEntries: new Set(responseTimeJVM).size,
    valueRange: `${Math.min(...responseTimeJVM).toFixed(1)}ms-${Math.max(...responseTimeJVM).toFixed(1)}ms`,
    average: `${(responseTimeJVM.reduce((a, b) => a + b, 0) / responseTimeJVM.length).toFixed(1)}ms`
  },
];