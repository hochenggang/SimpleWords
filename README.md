# 简单单词

## 是什么

一个背单词的网页

灵感来源于[google-10000-english](https://github.com/first20hours/google-10000-english) 和 [collins_high_frequency_vocabulary](https://github.com/isNeilLin/collins_high_frequency_vocabulary)，前者提供了单词使用频率和使用频率排名信息，后者提供了柯林斯常用词数据集。

我将这两个数据整合，并为每个单词或词组生成了描述信息，共计 13816 个单词，位于 detail.zip。

同时，为了减轻数据压力，我将柯林斯常用星级单词数据集中的词汇抽取出来，位于 collection.zip。


## 为什么

为了自己用，觉得可以试试写一个更轻量的

## 怎么用

修改 request.ts 中的域名为你自己的，然后编译，并部署到你的服务器。
把 collection.zip 和 detail.zip 上传到你的服务器并解压到 index.html 同级目录下的 collins 文件夹。

[Demo](https://words.imhcg.cn/)