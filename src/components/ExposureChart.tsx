'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Jan', exposures: 12 },
    { name: 'Feb', exposures: 19 },
    { name: 'Mar', exposures: 15 },
    { name: 'Apr', exposures: 25 },
    { name: 'May', exposures: 32 },
    { name: 'Jun', exposures: 28 },
    { name: 'Jul', exposures: 35 },
];

export default function ExposureChart() {
    return (
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{
                        top: 10,
                        right: 10,
                        left: -20,
                        bottom: 0,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                    <XAxis
                        dataKey="name"
                        stroke="#525252"
                        tick={{ fill: '#737373', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                    />
                    <YAxis
                        stroke="#525252"
                        tick={{ fill: '#737373', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '6px', fontSize: '12px' }}
                        itemStyle={{ color: '#fff' }}
                        cursor={{ fill: '#262626' }}
                    />
                    <Bar
                        dataKey="exposures"
                        fill="#ef4444"
                        radius={[4, 4, 0, 0]}
                        barSize={30}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
