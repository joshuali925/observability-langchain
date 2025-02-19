
const randfloat = (min, max) => Math.random() * (max - min) + min;
const randint = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

const randarray = Array.from({ length: 24 }, (v, i) => i < 18 ? randint(45, 48) : randint(70, 80))

export const apm_data = [
  {
    name: 'Total throughput',
    data: '50.5M',
  },
  {
    name: 'Number of errors',
    data: '200',
  },
  {
    name: 'Total latency (ms)',
    data: '500.4K',
  },
  {
    name: 'Number of service',
    data: '12',
  },
  {
    name: 'Throughput over time',
    data: [
      {
        x: Array.from({ length: 24 }, (v, i) => i),
        y: Array.from({ length: 24 }, (v, i) => randfloat(0, 80)),
        marker: {
          color: 'rgb(108, 174, 217)',
        },
        width: 0.65,
        type: 'bar',
        name: 'Count',
      }
    ],
    layout: {
      height: 270,
      width: 270,
      legend: {
        orientation: 'h',
        traceorder: 'normal',
        x: 0,
        xanchor: 'left',
        y: 1.1
      },
      yaxis: { range: [0, 100] },
    }
  },
  {
    name: 'Error by type',
    data: [
      {
        x: Array.from({ length: 24 }, (v, i) => i),
        y: Array.from({ length: 24 }, (v, i) => randfloat(0, 5)),
        marker: {
          color: 'rgb(254, 217, 71)',
        },
        width: 0.65,
        type: 'bar',
        name: '2xx',
      },
      {
        x: Array.from({ length: 24 }, (v, i) => i),
        y: Array.from({ length: 24 }, (v, i) => randfloat(5, 10)),
        marker: {
          color: 'rgb(255, 118, 140)',
        },
        width: 0.65,
        type: 'bar',
        name: '4xx',
      },
      {
        x: Array.from({ length: 24 }, (v, i) => i),
        y: Array.from({ length: 24 }, (v, i) => randfloat(10, 20)),
        marker: {
          color: 'rgb(212, 65, 47)',
        },
        width: 0.65,
        type: 'bar',
        name: '5xx',
      }
    ],
    layout: {
      height: 270,
      width: 270,
      legend: {
        orientation: 'h',
        traceorder: 'normal',
        x: 0,
        xanchor: 'left',
        y: 1.1
      },
      yaxis: { range: [0, 100] },
    }
  },
  {
    name: 'Latency',
    data: [
      {
        x: Array.from({ length: 24 }, (v, i) => i),
        y: randarray,
        marker: {
          color: 'rgb(113, 176, 218)',
        },
        type: 'scatter',
        line: {
          shape: 'spline'
        },
        name: 'p99',
      },
      {
        x: Array.from({ length: 24 }, (v, i) => i),
        y: Array.from({ length: 24 }, (v, i) => randarray[i] * 0.8 - randfloat(0, 5)),
        marker: {
          color: 'rgb(88, 165, 67)',
        },
        type: 'scatter',
        line: {
          shape: 'spline'
        },
        name: 'p95',
      },
      {
        x: Array.from({ length: 24 }, (v, i) => i),
        y: Array.from({ length: 24 }, (v, i) => randarray[i] * 0.5 + randfloat(0, 5)),
        marker: {
          color: 'rgb(255, 193, 95)',
        },
        type: 'scatter',
        line: {
          shape: 'spline'
        },
        name: 'p50',
      },
    ],
    layout: {
      height: 270,
      width: 270,
      legend: {
        orientation: 'h',
        traceorder: 'normal',
        x: 0,
        xanchor: 'left',
        y: 1.1
      },
      yaxis: { range: [0, 100] },
    }
  },
  {
    name: 'Percentage of time spent by service type',
    type: 'chart',
    data: [
      {
        x: Array.from({ length: 24 }, (v, i) => i),
        y: Array.from({ length: 24 }, (v, i) => randfloat(19, 21)),
        type: 'scatter',
        line: {
          color: 'rgb(247, 197, 110)',
          width: 1,
          dash: 'solid',
          shape: 'spline',
        },
        name: 'Web external',
        mode: 'none',
        fill: 'tonexty',  // tozeroy
      },
      {
        x: Array.from({ length: 24 }, (v, i) => i),
        y: Array.from({ length: 24 }, (v, i) => randfloat(38, 40)),
        type: 'scatter',
        line: {
          color: 'rgb(111, 171, 96)',
          width: 1,
          dash: 'solid',
          shape: 'spline',
        },
        name: 'Redis',
        mode: 'none',
        fill: 'tonexty',  // tozeroy
      },
      {
        x: Array.from({ length: 24 }, (v, i) => i),
        y: Array.from({ length: 24 }, (v, i) => randfloat(75, 80)),
        type: 'scatter',
        line: {
          color: 'rgb(156, 120, 215)',
          width: 1,
          dash: 'solid',
          shape: 'spline',
        },
        name: 'MySQL',
        mode: 'none',
        fill: 'tonexty',  // tozeroy
      },
      {
        x: Array.from({ length: 24 }, (v, i) => i),
        y: Array.from({ length: 24 }, (v, i) => 100),
        type: 'scatter',
        line: {
          color: 'rgb(74, 156, 208)',
          width: 1,
          dash: 'solid',
          shape: 'spline',
        },
        name: 'JVM',
        mode: 'none',
        fill: 'tonexty',  // tozeroy
      },
    ],
    layout: {
      height: 270,
      width: 270,
      legend: {
        orientation: 'h',
        traceorder: 'normal',
        x: 0,
        xanchor: 'left',
        y: 1.1
      },
      yaxis: { range: [0, 100] },
    }
  },
  {
    name: 'Throughput by service',
    data: [
      {
        values: [70, 70, 40, 40, 40, 40, 15, 15, 15, 15],
        labels: ['Produce', 'ComparisonAlgo', 'Purchase', 'Payment', 'Verification', 'Users', 'Credentials', 'Preferences', 'Order', 'Others'],
        marker: {
          colors: ['rgb(231, 238, 148)', 'rgb(159, 210, 144)', 'rgb(136, 190, 224)', 'rgb(222, 149, 215)', 'rgb(214, 173, 111)', 'rgb(175, 149, 233)', 'rgb(120, 137, 116)', 'rgb(224, 108, 5)', 'rgb(209, 50, 17)', 'rgb(169, 183, 184)'],
        },
        type: 'pie',
        textinfo: 'none',
      }
    ],
    layout: {
      height: 300,
      width: 450,
      // showlegend: false,
      legend: {
        orientation: 'h',
        traceorder: 'normal',
        x: 0,
        xanchor: 'left',
        y: 1.5
      },
      margin: {
        l: 5,
        r: 5,
        b: 5,
        t: 5,  // 10
      },
    }
  },
  {
    name: 'Latency by request and spans',
    data: [
      {
        x: Array.from({ length: 10 }, (v, i) => Math.random() > 0.7 ? randint(0, 20) : 0),
        y: ['service: request3', 'service: request2', 'service: request1', 'Address: verify', 'Payment: cardsecurity', 'MLLearning: scoring', 'Credentials: name', 'Comparison: reviews', 'Verify: bankVerify', 'Purchase: Checkout'],
        marker: {
          color: 'rgb(132, 188, 223)',
        },
        width: 0.4,
        type: 'bar',
        orientation: 'h',
        name: 'Purchase',
      },
      {
        x: Array.from({ length: 10 }, (v, i) => Math.random() > 0.7 ? randint(0, 20) : 0),
        y: ['service: request3', 'service: request2', 'service: request1', 'Address: verify', 'Payment: cardsecurity', 'MLLearning: scoring', 'Credentials: name', 'Comparison: reviews', 'Verify: bankVerify', 'Purchase: Checkout'],
        marker: {
          color: 'rgb(179, 137, 218)',
        },
        width: 0.4,
        type: 'bar',
        orientation: 'h',
        name: 'Users',
      },
      {
        x: Array.from({ length: 10 }, (v, i) => Math.random() > 0.7 ? randint(0, 20) : 0),
        y: ['service: request3', 'service: request2', 'service: request1', 'Address: verify', 'Payment: cardsecurity', 'MLLearning: scoring', 'Credentials: name', 'Comparison: reviews', 'Verify: bankVerify', 'Purchase: Checkout'],
        marker: {
          color: 'rgb(222, 149, 215)',
        },
        width: 0.4,
        type: 'bar',
        orientation: 'h',
        name: 'Payment',
      },
      {
        x: Array.from({ length: 10 }, (v, i) => Math.random() > 0.7 ? randint(0, 20) : 0),
        y: ['service: request3', 'service: request2', 'service: request1', 'Address: verify', 'Payment: cardsecurity', 'MLLearning: scoring', 'Credentials: name', 'Comparison: reviews', 'Verify: bankVerify', 'Purchase: Checkout'],
        marker: {
          color: 'rgb(159, 210, 144)',
        },
        width: 0.4,
        type: 'bar',
        orientation: 'h',
        name: 'ComparisonAlgo',
      },
      {
        x: Array.from({ length: 10 }, (v, i) => Math.random() > 0.7 ? randint(0, 20) : 0),
        y: ['service: request3', 'service: request2', 'service: request1', 'Address: verify', 'Payment: cardsecurity', 'MLLearning: scoring', 'Credentials: name', 'Comparison: reviews', 'Verify: bankVerify', 'Purchase: Checkout'],
        marker: {
          color: 'rgb(169, 183, 184)',
        },
        width: 0.4,
        type: 'bar',
        orientation: 'h',
        name: 'Others',
      },
      {
        x: Array.from({ length: 10 }, (v, i) => Math.random() > 0.7 ? randint(0, 20) : 0),
        y: ['service: request3', 'service: request2', 'service: request1', 'Address: verify', 'Payment: cardsecurity', 'MLLearning: scoring', 'Credentials: name', 'Comparison: reviews', 'Verify: bankVerify', 'Purchase: Checkout'],
        marker: {
          color: 'rgb(120, 137, 116)',
        },
        width: 0.4,
        type: 'bar',
        orientation: 'h',
        name: 'Credentials',
      },
      {
        x: Array.from({ length: 10 }, (v, i) => Math.random() > 0.7 ? randint(0, 20) : 0),
        y: ['service: request3', 'service: request2', 'service: request1', 'Address: verify', 'Payment: cardsecurity', 'MLLearning: scoring', 'Credentials: name', 'Comparison: reviews', 'Verify: bankVerify', 'Purchase: Checkout'],
        marker: {
          color: 'rgb(250, 200, 123)',
        },
        width: 0.4,
        type: 'bar',
        orientation: 'h',
        name: 'Verification',
      },
      {
        x: Array.from({ length: 10 }, (v, i) => Math.random() > 0.7 ? randint(0, 20) : 0),
        y: ['service: request3', 'service: request2', 'service: request1', 'Address: verify', 'Payment: cardsecurity', 'MLLearning: scoring', 'Credentials: name', 'Comparison: reviews', 'Verify: bankVerify', 'Purchase: Checkout'],
        marker: {
          color: 'rgb(231, 238, 148)',
        },
        width: 0.4,
        type: 'bar',
        orientation: 'h',
        name: 'Product',
      },
      {
        x: Array.from({ length: 10 }, (v, i) => Math.random() > 0.7 ? randint(0, 20) : 0),
        y: ['service: request3', 'service: request2', 'service: request1', 'Address: verify', 'Payment: cardsecurity', 'MLLearning: scoring', 'Credentials: name', 'Comparison: reviews', 'Verify: bankVerify', 'Purchase: Checkout'],
        marker: {
          color: 'rgb(224, 108, b5)',
        },
        width: 0.4,
        type: 'bar',
        orientation: 'h',
        name: 'Preferences',
      },
      {
        x: Array.from({ length: 10 }, (v, i) => Math.random() > 0.7 ? randint(0, 20) : 0),
        y: ['service: request3', 'service: request2', 'service: request1', 'Address: verify', 'Payment: cardsecurity', 'MLLearning: scoring', 'Credentials: name', 'Comparison: reviews', 'Verify: bankVerify', 'Purchase: Checkout'],
        marker: {
          color: 'rgb(209, 50, 17)',
        },
        width: 0.4,
        type: 'bar',
        orientation: 'h',
        name: 'Order',
      },
    ],
    layout: {
      height: 500,
      width: 1000,
      legend: {
        orientation: 'h',
        traceorder: 'normal',
        x: 0,
        xanchor: 'left',
        y: 1.1
      },
      margin: {
        l: 200,
        r: 5,
        b: 30,
        t: 30,  // 10
      },
      xaxis: {
        autorange: true,
        ticksuffix: " ms"
      },
    }
  },
]