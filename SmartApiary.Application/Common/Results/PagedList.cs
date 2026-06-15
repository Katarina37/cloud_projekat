// Zajednicki format za uspeh ili gresku (PagedList).

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartApiary.Application.Common.Results
{

    public class PagedList<T>
    {
        public PagedList(IReadOnlyList<T> items, int count, int pageNumber, int pageSize)
        {
            PageNumber = pageNumber;
            TotalPages = (int)Math.Ceiling(count / (double)pageSize);
            TotalCount = count;
            Items = items;
        }

        public int PageNumber { get; }
        public int TotalPages { get; }
        public int TotalCount { get; }
        public IReadOnlyList<T> Items { get; }
    }
}
