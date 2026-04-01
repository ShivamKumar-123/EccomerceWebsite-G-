from rest_framework.pagination import PageNumberPagination


class ProductPagination(PageNumberPagination):
    page_size = 12
    page_query_param = "page"
    page_size_query_param = "page_size"
    max_page_size = 100

    def get_page_size(self, request):
        if request.user.is_authenticated:
            try:
                raw = request.query_params.get(self.page_size_query_param)
                if raw is None or str(raw).strip() == "":
                    return 500
                n = int(raw)
                return max(1, min(n, 2000))
            except (TypeError, ValueError):
                return 500
        return super().get_page_size(request)
