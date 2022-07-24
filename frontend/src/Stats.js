import React from 'react'
import './App.css'
import stats from './stats_short.json'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Link } from 'react-router-dom';
import Helmet from 'react-helmet';

const columns = [
    { id: 'source', label: 'Извор', minWidth: 170 },
    { id: 'samples', label: 'Број на анализирани објави', minWidth: 100, align:'right' },
    { id: 'bias_per', label: 'Процент на пристрасност', minWidth: 100, align:'right',format: (value) => value.toFixed(2)+'%', },
    { id: 'index_per', label: 'Индекс на пристрасност', minWidth: 100, align:'right',format: (value) => value.toFixed(2)+'%', },
    { id: 'index_per', label: 'Степен на пристрасност', minWidth: 100,align:'center'},
  ];

const Stats = () => {
    return(
        <div style={{textAlign:'center'}}>
            <Helmet>
                <meta charSet="utf-8" />
                <title>Ранкинг на пристрасност | Пристрасност</title>
                <link rel="description" content="Види ранкинг на политичка пристрасност на македонски весници" />
            </Helmet>
            <div style={{margin:'50px'}}>
                <div className='wrap' style={{justifyContent:'space-evenly'}}>
                    <h2 style={{color:'white'}}><span style={{color:'#E76D83'}}>38 </span> &nbsp;медиуми</h2>
                    <h2 style={{color:'white'}}><span style={{color:'#9CC4B2'}}>296.792 </span> &nbsp;објави</h2>
                    <h2 style={{color:'white'}}><span style={{color:'#C98CA7'}}>4.701.022 </span> &nbsp;реченици</h2>
                </div>
                <h1 style={{color:'white'}}>Анализа за политичка пристрасност</h1>
                <h3 style={{color:'white'}}>Со помош на вештачка интелегенција</h3>
                <p style={{color:'white'}}>Јули 2021 - Јули 2022</p>
            </div>
            <div style={{padding:'0 5%',width:'90%'}}>
            <TableContainer sx={{ maxHeight: '84vh' }}>
                <Table stickyHeader aria-label="sticky table">
                <TableHead>
                    <TableRow>
                    {columns.map((column) => (
                        <TableCell
                        key={column.id}
                        align={column.align}
                        style={{ minWidth: column.minWidth }}
                        >
                        {column.label}
                        </TableCell>
                    ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {stats.data.reverse().map((row) => {
                        return (
                        <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                            {columns.map((column,index) => {
                                let i = index>1 ? index+1 : index;
                                if(i == 3) i=4;
                                else if(i == 4) i=3;
                                let value = row[i]
                                if(index == 4){
                                    value = row[3] > 20 ? 'Високо' : row[3] > 10 || row[4] > 15 ? 'Средно' : row[3] < 1 && row[4] < 1 ? 'Комплетно непристрасен' : 'Ниско'
                                }
                                return (
                                    <TableCell key={column.id} align={column.align}>
                                    {column.format && typeof value === 'number'
                                        ? (i == 3 ? <b>{column.format(value)}</b> : column.format(value))
                                        : index == 4 ? (value=='Високо'?<b style={{color:'#E76D83'}}>{value}</b> : value=='Средно' ? <b style={{color:'#FFFFA7'}}>{value}</b>:<b style={{color:'#9CC4B2'}}>{value}</b>) : value}
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                        );
                    })}
                </TableBody>
                </Table>
            </TableContainer>
            </div>
            <div style={{padding:'20px',color:'white'}}>
            <p><b>Забелешка: </b>Резултатите не се точна репрезентација на вистинската пристрасност на медиумите, туку даваат груба претстава за неа и блискоста на објавените статии со статиите на прес центрите на 2те најголеми политички партии.</p>
                <hr/>
            </div>
            <div style={{color:'white', textAlign:'start',padding:'30px'}}>
                <h3>За анализата</h3>
                <p>Направен е модел на длабоко машинско учење, истрениран со објави од прес центрите на 2те најголеми политички партии во Македонија. Прочитај подетално <a href='https://medium.com/@danilo.najkov/detecting-political-bias-in-online-articles-using-nlp-and-classification-models-c1a40ec3989b'>тука</a>. Анализирани се околу 300000 статии од различни извори, објавени во период од Јули 2021 до Јули 2022. Статиите се избрани од категорија Македонија или Политика. </p>
                <h3>Колони:</h3>
                <ul>
                    <li>Извор - Веб портал на изворот на статиите кои се анализирани.</li>
                    <li>Број на анализирани објави - Бројот на статии кои што се анализирани со помош на моделот на машинско учење за тој извор.</li>
                    <li>Процент на пристрасност - Претставува вкупен однос на пристрасни статии наспрема сите статии од тој извор.</li>
                    <li>Индекс на пристрасност - Подобра мерка за мерење пристрасност. Се пресметува како однос од апсолутната разлика на пристрасни статии кон двете партии, врз вкупниот број на статии од тој извор.</li>
                    <li>Степен на пристрасност - Описна мерка за пристрасноста. Се одредува според процентот и индексот на пристрасност.</li>
                </ul>
                <h3>Одреди пристрасност</h3>
                <p>Одреди пристрасност на веб статија или текст онлајн на <Link to='/'>овој линк</Link></p>
            </div>
        </div>
    )
}

export default Stats;